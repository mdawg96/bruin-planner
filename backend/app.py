from flask import Flask, request, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from flask_cors import CORS
import logging
import time
from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "your_mongo_db_uri")
client = MongoClient(mongo_uri)
db = client['Cluster0']
users_collection = db['users']
registration_attempts_collection = db['registration_attempts']

MAX_REGISTRATIONS_PER_DAY = 3

@app.route('/login/', methods=['POST'])
def login_page():
    if request.method == 'POST':
        try:
            username = request.json['username']
            password = request.json['password']
            user = users_collection.find_one({"username": username})
            if user and user['password'] == password:
                return {"auth": "success"}
            return {"auth": "failure"}
        except Exception as e:
            logging.error(f"Error during login: {str(e)}")
            return {"auth": "failure"}

@app.route('/create_an_account/', methods=['POST'])
def create_an_account():
    start_time = time.time()
    try:
        ip_address = request.remote_addr
        logging.debug(f"IP address: {ip_address}")

        registration_count = count_registration_attempts(ip_address)
        logging.debug(f"Registration count for IP {ip_address}: {registration_count}")

        if registration_count >= MAX_REGISTRATIONS_PER_DAY:
            logging.warning("Max registrations per day exceeded.")
            return {"status": "failure", "message": "Please try again tomorrow"}

        username = request.json['username']
        password = request.json['password']
        
        logging.debug(f"Received username: {username}")

        if users_collection.find_one({"username": username}):
            logging.warning(f"User {username} already exists.")
            return {"status": "failure", "message": "User already exists."}

        users_collection.insert_one({
            "username": username,
            "password": password,
            "selected_classes": [],
            "custom_options": []
        })
        record_registration_attempt(ip_address)
        logging.info(f"User {username} successfully registered.")
        return {"status": "success"}
    except KeyError:
        logging.error("Username or password not provided")
        return {"status": "failure", "message": "Username or password not provided."}
    except Exception as e:
        logging.error(f"Error during registration: {str(e)}")
        return {"status": "failure", "message": str(e)}
    finally:
        end_time = time.time()
        logging.debug(f"create_an_account took {end_time - start_time} seconds")

@app.route('/getUserClasses/', methods=['POST'])
def get_user_classes():
    try:
        username = request.json['username']
        user = users_collection.find_one({"username": username})
        if user:
            return jsonify({
                "selected_classes": user.get('selected_classes', []),
                "custom_options": user.get('custom_options', [])
            })
        return jsonify({"status": "failure", "message": "User not found"})
    except Exception as e:
        logging.error(f"Error fetching user classes: {str(e)}")
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/updateUserClasses/', methods=['POST'])
def update_user_classes():
    try:
        username = request.json['username']
        selected_classes = request.json['selected_classes']
        custom_options = request.json['custom_options']
        user = users_collection.find_one({"username": username})
        if not user:
            return {"status": "failure", "message": "User not found"}
        users_collection.update_one(
            {"username": username},
            {"$set": {"selected_classes": selected_classes, "custom_options": custom_options}}
        )
        logging.info(f"User {username}'s classes updated")
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error updating user classes: {str(e)}")
        return {"status": "failure", "message": str(e)}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def record_registration_attempt(ip_address):
    registration_attempts_collection.insert_one({
        "ip_address": ip_address,
        "timestamp": datetime.datetime.now()
    })
    logging.debug(f"Recorded registration attempt from IP {ip_address}")

def count_registration_attempts(ip_address):
    today = datetime.datetime.now().date()
    count = registration_attempts_collection.count_documents({
        "ip_address": ip_address,
        "timestamp": {"$gte": datetime.datetime(today.year, today.month, today.day)}
    })
    logging.debug(f"Counted {count} registration attempts from IP {ip_address} today")
    return count

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
