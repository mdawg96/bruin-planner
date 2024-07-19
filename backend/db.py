import datetime
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import logging

class User:
    def __init__(self, username, password, selected_classes=None, custom_options=None):
        self.username = username
        self.password = password
        self.selected_classes = selected_classes if selected_classes is not None else []
        self.custom_options = custom_options if custom_options is not None else []

    def to_dict(self):
        return {
            "username": self.username,
            "password": self.password,
            "selected_classes": self.selected_classes,
            "custom_options": self.custom_options
        }

class Database:
    def __init__(self, uri):
        self.client = MongoClient(uri, server_api=ServerApi('1'))
        self.db = self.client['Cluster0']  # Replace with your actual database name
        self.users = self.db['users']
        self.registration_attempts = self.db['registration_attempts']
        logging.debug("Database initialized")

    def get_user(self, username):
        user_data = self.users.find_one({"username": username})
        logging.debug(f"Queried for user {username}: {user_data}")
        if user_data:
            return User(
                username=user_data['username'],
                password=user_data['password'],
                selected_classes=user_data.get('selected_classes', []),
                custom_options=user_data.get('custom_options', [])
            )
        return None

    def add_user(self, user):
        if self.get_user(user.username):
            logging.debug(f"User {user.username} already exists")
            return False
        self.users.insert_one(user.to_dict())
        logging.debug(f"User {user.username} added to database")
        return True

    def update_user_classes(self, username, selected_classes, custom_options):
        self.users.update_one(
            {"username": username},
            {"$set": {"selected_classes": selected_classes, "custom_options": custom_options}}
        )
        logging.debug(f"User {username}'s classes updated")

    def record_registration_attempt(self, ip_address):
        self.registration_attempts.insert_one({
            "ip_address": ip_address,
            "timestamp": datetime.datetime.now()
        })
        logging.debug(f"Recorded registration attempt from IP {ip_address}")

    def count_registration_attempts(self, ip_address):
        today = datetime.datetime.now().date()
        count = self.registration_attempts.count_documents({
            "ip_address": ip_address,
            "timestamp": {"$gte": datetime.datetime(today.year, today.month, today.day)}
        })
        logging.debug(f"Counted {count} registration attempts from IP {ip_address} today")
        return count
