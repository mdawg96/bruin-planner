from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from backend.db import User, Database  # updated import
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://mdawg96.github.io"}})
app.config['CORS_HEADERS'] = 'Content-Type'

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
database = Database(mongo_uri)

MAX_REGISTRATIONS_PER_DAY = 3

@app.route('/login/', methods=['POST'])
def login():
    try:
        username = request.json['username']
        password = request.json['password']
        user = database.get_user(username)
        if user and user.password == password:
            return {"auth": "success"}
        return {"auth": "failure"}
    except Exception as e:
        return {"auth": "failure"}

@app.route('/create_an_account/', methods=['POST'])
def create_an_account():
    try:
        ip_address = request.remote_addr
        registration_count = database.count_registration_attempts(ip_address)
        if registration_count >= MAX_REGISTRATIONS_PER_DAY:
            return {"status": "failure", "message": "Please try again tomorrow"}

        username = request.json['username']
        password = request.json['password']
        
        if database.add_user(User(username, password)):
            database.record_registration_attempt(ip_address)
            return {"status": "success"}
        return {"status": "failure", "message": "User already exists."}
    except KeyError:
        return {"status": "failure", "message": "Username or password not provided."}
    except Exception as e:
        return {"status": "failure", "message": str(e)}

@app.route('/getUserClasses/', methods=['POST'])
def get_user_classes():
    try:
        username = request.json['username']
        user = database.get_user(username)
        if user:
            return jsonify({
                "selected_classes": user.selected_classes,
                "custom_options": user.custom_options
            })
        return jsonify({"status": "failure", "message": "User not found"})
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/updateUserClasses/', methods=['POST'])
def update_user_classes():
    try:
        username = request.json['username']
        selected_classes = request.json['selected_classes']
        custom_options = request.json['custom_options']
        user = database.get_user(username)
        if not user:
            return {"status": "failure", "message": "User not found"}
        database.update_user_classes(username, selected_classes, custom_options)
        return {"status": "success"}
    except Exception as e:
        return {"status": "failure", "message": str(e)}

if __name__ == '__main__':
    app.run()
