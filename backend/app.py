from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from flask_cors import CORS
import datetime

# Load environment variables
load_dotenv()

# Get the MongoDB URI from environment variables
mongo_uri = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)
database = client['Project0']  # Replace 'Project0' with your actual database name if different

app = Flask(__name__)
CORS(app)

MAX_REGISTRATIONS_PER_DAY = 3

@app.route('/login/', methods=['POST'])
def login_page():
    if request.method == 'POST':
        try:
            username = request.json['username']
            password = request.json['password']
            user = database['users'].find_one({"username": username})
            if user and user['password'] == password:
                return {"auth": "success"}
            return {"auth": "failure"}
        except Exception as e:
            return {"auth": "failure"}
    return jsonify({"error": "Invalid request method"}), 405

@app.route('/create_an_account/', methods=['POST'])
def create_an_account():
    try:
        ip_address = request.remote_addr
        registration_count = database['registration_attempts'].count_documents({"ip_address": ip_address})
        if registration_count >= MAX_REGISTRATIONS_PER_DAY:
            return {"status": "failure", "message": "Please try again tomorrow"}

        username = request.json['username']
        password = request.json['password']
        
        if database['users'].find_one({"username": username}):
            return {"status": "failure", "message": "User already exists."}
        
        database['users'].insert_one({"username": username, "password": password})
        database['registration_attempts'].insert_one({"ip_address": ip_address, "timestamp": datetime.datetime.now()})
        return {"status": "success"}
    except KeyError:
        return {"status": "failure", "message": "Username or password not provided."}
    except Exception as e:
        return {"status": "failure", "message": str(e)}

if __name__ == '__main__':
    app.run()
