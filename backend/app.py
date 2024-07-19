from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging
import os
import datetime
from pymongo import MongoClient

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI", "your_mongo_db_uri")
client = MongoClient(mongo_uri)
db = client['Cluster0']
users_collection = db['users']
registration_attempts_collection = db['registration_attempts']

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/login/', methods=['POST'])
def login_page():
    try:
        username = request.json['username']
        password = request.json['password']
        user = users_collection.find_one({"username": username})
        if user and user['password'] == password:
            return jsonify({"auth": "success"})
        return jsonify({"auth": "failure"})
    except Exception as e:
        logging.error(f"Error during login: {str(e)}")
        return jsonify({"auth": "failure"})

@app.route('/create_an_account/', methods=['POST'])
def create_an_account():
    try:
        ip_address = request.remote_addr
        username = request.json['username']
        password = request.json['password']
        
        if users_collection.find_one({"username": username}):
            return jsonify({"status": "failure", "message": "User already exists."})

        users_collection.insert_one({"username": username, "password": password, "selected_classes": [], "custom_options": []})
        return jsonify({"status": "success"})
    except KeyError:
        return jsonify({"status": "failure", "message": "Username or password not provided."})
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/getUserClasses/', methods=['POST'])
def get_user_classes():
    try:
        username = request.json['username']
        user = users_collection.find_one({"username": username})
        if user:
            return jsonify({"selected_classes": user.get('selected_classes', []), "custom_options": user.get('custom_options', [])})
        return jsonify({"status": "failure", "message": "User not found"})
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/updateUserClasses/', methods=['POST'])
def update_user_classes():
    try:
        username = request.json['username']
        selected_classes = request.json['selected_classes']
        custom_options = request.json['custom_options']
        users_collection.update_one({"username": username}, {"$set": {"selected_classes": selected_classes, "custom_options": custom_options}})
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
