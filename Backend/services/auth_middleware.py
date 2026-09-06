from functools import wraps
from flask import request, jsonify

def role_required(*allowed_roles):
    """
    Decorator to restrict access to specific user roles (e.g. DONOR, NGO, VOLUNTEER, ADMIN).
    Usage:
        @role_required('DONOR', 'ADMIN')
        def my_protected_route():
            ...
    Expects request header 'X-User-Role' (e.g., 'X-User-Role: DONOR').
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check user role header
            user_role = request.headers.get('X-User-Role', '').upper()
            
            if not user_role:
                return jsonify({
                    "status": "error",
                    "message": "Missing authorization header 'X-User-Role'"
                }), 401

            if user_role not in [r.upper() for r in allowed_roles]:
                return jsonify({
                    "status": "error",
                    "message": f"Forbidden: Role '{user_role}' is not authorized to access this resource. Allowed roles: {', '.join(allowed_roles)}"
                }), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
