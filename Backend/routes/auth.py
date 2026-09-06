from flask import Blueprint, request, jsonify
from models.user import UserModel

auth_bp = Blueprint('auth', __name__)

VALID_ROLES = ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN']

@auth_bp.route('/api/register', methods=['POST'])
def register():
    """
    POST /api/register
    Registers a new user (DONOR, NGO, VOLUNTEER, or ADMIN) with password hashing.
    """
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Missing JSON request body"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role', '').upper()
    address = data.get('address')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    # Input validation
    if not all([name, email, password, phone, role, address]):
        return jsonify({
            "status": "error", 
            "message": "Missing required fields: name, email, password, phone, role, address"
        }), 400

    if role not in VALID_ROLES:
        return jsonify({
            "status": "error",
            "message": f"Invalid role. Allowed roles are: {', '.join(VALID_ROLES)}"
        }), 400

    # Check if email is already registered
    existing_user = UserModel.find_by_email(email)
    if existing_user:
        return jsonify({
            "status": "error",
            "message": "Email is already registered. Please login instead."
        }), 400

    try:
        # Create user in database with hashed password
        user_id = UserModel.create_user(name, email, password, phone, role, address, latitude, longitude)
        return jsonify({
            "status": "success",
            "message": "User registered successfully!",
            "data": {
                "user_id": user_id,
                "name": name,
                "email": email,
                "role": role
            }
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Registration failed: {str(e)}"}), 500


@auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    POST /api/login
    Authenticates user credentials against hashed password.
    """
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Missing JSON request body"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    user = UserModel.find_by_email(email)
    if not user:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    # Verify password hash
    if not UserModel.verify_password(user['password'], password):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    # Hide password hash from return payload
    user.pop('password', None)

    return jsonify({
        "status": "success",
        "message": f"Welcome back, {user['name']}!",
        "user": user
    }), 200
