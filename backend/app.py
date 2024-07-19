from flask import Flask, request, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from db import User, Database
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
database = Database(mongo_uri)

MAX_REGISTRATIONS_PER_DAY = 3

@app.route('/login/', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        try:
            username = request.json.get('username')
            password = request.json.get('password')
            
            if not username or not password:
                return jsonify({"auth": "failure", "message": "Username and password required"}), 400

            user = database.get_user(username)
            if user and check_password_hash(user.password, password):
                return jsonify({"auth": "success"})
            return jsonify({"auth": "failure", "message": "Invalid credentials"}), 401
        except Exception as e:
            return jsonify({"auth": "failure", "message": str(e)}), 500
    
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/create_an_account/', methods=['POST'])
def create_an_account():
    try:
        ip_address = request.remote_addr
        registration_count = database.count_registration_attempts(ip_address)
        if registration_count >= MAX_REGISTRATIONS_PER_DAY:
            return jsonify({"status": "failure", "message": "Please try again tomorrow"}), 429

        username = request.json.get('username')
        password = request.json.get('password')
        
        if not username or not password:
            return jsonify({"status": "failure", "message": "Username and password required"}), 400

        hashed_password = generate_password_hash(password)
        if database.add_user(User(username, hashed_password)):
            database.record_registration_attempt(ip_address)
            return jsonify({"status": "success"})
        return jsonify({"status": "failure", "message": "User already exists"}), 409
    except KeyError:
        return jsonify({"status": "failure", "message": "Username or password not provided"}), 400
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)}), 500

@app.route('/getUserClasses/', methods=['POST'])
def get_user_classes():
    try:
        username = request.json.get('username')
        if not username:
            return jsonify({"status": "failure", "message": "Username required"}), 400
        
        user = database.get_user(username)
        if user:
            return jsonify({
                "selected_classes": user.selected_classes,
                "custom_options": user.custom_options
            })
        return jsonify({"status": "failure", "message": "User not found"}), 404
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)}), 500

@app.route('/updateUserClasses/', methods=['POST'])
def update_user_classes():
    try:
        username = request.json.get('username')
        selected_classes = request.json.get('selected_classes')
        custom_options = request.json.get('custom_options')
        
        if not username:
            return jsonify({"status": "failure", "message": "Username required"}), 400
        
        user = database.get_user(username)
        if not user:
            return jsonify({"status": "failure", "message": "User not found"}), 404

        database.update_user_classes(username, selected_classes, custom_options)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)}), 500

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
