import datetime
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

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
        self.db = self.client['cluster0']
        self.users = self.db['users']
        self.registration_attempts = self.db['registration_attempts']

    def get_user(self, username):
        user_data = self.users.find_one({"username": username})
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
            return False  # User already exists
        self.users.insert_one(user.to_dict())
        return True

    def update_user_classes(self, username, selected_classes, custom_options):
        self.users.update_one(
            {"username": username},
            {"$set": {"selected_classes": selected_classes, "custom_options": custom_options}}
        )

    def record_registration_attempt(self, ip_address):
        self.registration_attempts.insert_one({
            "ip_address": ip_address,
            "timestamp": datetime.datetime.now()
        })

    def count_registration_attempts(self, ip_address):
        today = datetime.datetime.now().date()
        return self.registration_attempts.count_documents({
            "ip_address": ip_address,
            "timestamp": {"$gte": datetime.datetime(today.year, today.month, today.day)}
        })
