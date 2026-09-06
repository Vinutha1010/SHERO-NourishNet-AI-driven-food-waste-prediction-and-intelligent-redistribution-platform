import os
from dotenv import load_dotenv

# Load environment variables from .env file with override=True
load_dotenv(override=True)

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'admin')
    MYSQL_DB = os.getenv('MYSQL_DB', 'shero_nourishnet')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_shero_secret_key')
    PORT = int(os.getenv('PORT', 5000))
