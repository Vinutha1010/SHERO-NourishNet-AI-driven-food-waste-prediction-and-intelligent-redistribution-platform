import mysql.connector
from mysql.connector import Error
from config import Config

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database along with error info if any.
    Returns: (connection_object, error_message)
    """
    try:
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            autocommit=True
        )
        return connection, None
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None, str(e)

def execute_query(query, params=None):
    """
    Executes an INSERT, UPDATE, or DELETE query and returns affected row count / last row id.
    """
    conn, err = get_db_connection()
    if not conn:
        raise Exception(f"Database Connection Error: {err}")
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        last_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return last_id
    except Error as e:
        print(f"Database Query Error: {e}")
        if conn:
            conn.close()
        raise e

def fetch_one(query, params=None):
    """
    Fetches a single row matching the query as a dictionary.
    """
    conn, err = get_db_connection()
    if not conn:
        raise Exception(f"Database Connection Error: {err}")
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except Error as e:
        print(f"Database Fetch Error: {e}")
        if conn:
            conn.close()
        raise e

def fetch_all(query, params=None):
    """
    Fetches all rows matching the query as a list of dictionaries.
    """
    conn, err = get_db_connection()
    if not conn:
        raise Exception(f"Database Connection Error: {err}")
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Error as e:
        print(f"Database Fetch All Error: {e}")
        if conn:
            conn.close()
        raise e
