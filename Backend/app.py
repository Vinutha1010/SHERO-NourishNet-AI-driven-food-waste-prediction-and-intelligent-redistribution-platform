from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import get_db_connection
from routes.auth import auth_bp
from routes.food import food_bp
from routes.requests import requests_bp
from routes.matching import matching_bp
from routes.delivery import delivery_bp
from routes.tracking import tracking_bp
from routes.feedback import feedback_bp
from routes.admin import admin_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable Cross-Origin Resource Sharing (CORS) for frontend integration (Updated env load)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(food_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(matching_bp)
app.register_blueprint(delivery_bp)
app.register_blueprint(tracking_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(admin_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check route to verify Flask app status and MySQL database connectivity.
    """
    conn, err = get_db_connection()
    if conn and conn.is_connected():
        conn.close()
        return jsonify({
            "status": "success",
            "message": "SHERO-NourishNet API server is running!",
            "database": "Connected to MySQL successfully"
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "SHERO-NourishNet API server is running, but MySQL connection failed.",
            "error_details": err,
            "database": "Disconnected"
        }), 500

@app.errorhandler(Exception)
def handle_global_exception(e):
    """
    Global exception handler to return clean JSON error responses instead of HTML tracebacks.
    """
    return jsonify({
        "status": "error",
        "message": f"Server Exception: {str(e)}"
    }), 500

if __name__ == '__main__':
    print(f"Starting SHERO-NourishNet Backend on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
