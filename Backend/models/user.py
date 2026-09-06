from db import fetch_one, execute_query, fetch_all
from werkzeug.security import generate_password_hash, check_password_hash

class UserModel:
    @staticmethod
    def create_user(name, email, password, phone, role, address, latitude=None, longitude=None):
        """
        Hashes password and creates a new user in the MySQL database.
        """
        hashed_password = generate_password_hash(password)
        query = """
            INSERT INTO users (name, email, password, phone, role, address, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (name, email, hashed_password, phone, role, address, latitude, longitude)
        return execute_query(query, params)

    @staticmethod
    def find_by_email(email):
        """
        Finds a user record by their email address.
        """
        query = "SELECT * FROM users WHERE email = %s"
        return fetch_one(query, (email,))

    @staticmethod
    def find_by_id(user_id):
        """
        Finds a user record by user_id (excluding password for security).
        """
        query = "SELECT user_id, name, email, phone, role, address, latitude, longitude, created_at FROM users WHERE user_id = %s"
        return fetch_one(query, (user_id,))

    @staticmethod
    def verify_password(stored_password_hash, provided_password):
        """
        Compares plain-text password with stored hash.
        """
        return check_password_hash(stored_password_hash, provided_password)
