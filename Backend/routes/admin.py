from flask import Blueprint, request, jsonify
from db import fetch_all, fetch_one
from models.food import FoodModel
from models.request import RequestModel
from models.delivery import DeliveryModel

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """
    GET /api/admin/users
    Admin views all registered users with optional role filtering (?role=DONOR)
    """
    role = request.args.get('role')
    query = "SELECT user_id, name, email, phone, role, address, latitude, longitude, created_at FROM users WHERE 1=1"
    params = []
    if role:
        query += " AND role = %s"
        params.append(role.upper())
    query += " ORDER BY created_at DESC"

    users = fetch_all(query, params)
    return jsonify({"status": "success", "count": len(users), "data": users}), 200


@admin_bp.route('/api/admin/food', methods=['GET'])
def admin_get_food():
    """
    GET /api/admin/food
    Admin views all food listings across system.
    """
    food_list = FoodModel.get_all_food()
    return jsonify({"status": "success", "count": len(food_list), "data": food_list}), 200


@admin_bp.route('/api/admin/requests', methods=['GET'])
def admin_get_requests():
    """
    GET /api/admin/requests
    Admin views all food requests.
    """
    requests_list = RequestModel.get_all_requests()
    return jsonify({"status": "success", "count": len(requests_list), "data": requests_list}), 200


@admin_bp.route('/api/admin/deliveries', methods=['GET'])
def admin_get_deliveries():
    """
    GET /api/admin/deliveries
    Admin views all delivery tracks.
    """
    deliveries_list = DeliveryModel.get_all_deliveries()
    return jsonify({"status": "success", "count": len(deliveries_list), "data": deliveries_list}), 200


@admin_bp.route('/api/admin/statistics', methods=['GET'])
def admin_get_statistics():
    """
    GET /api/admin/statistics
    Calculates overall system operational stats and metrics.
    """
    # Total users grouped by role
    user_counts = fetch_all("SELECT role, COUNT(*) as count FROM users GROUP BY role")
    
    # Food metrics
    food_stats = fetch_one("SELECT COUNT(*) as total_food_listings, COALESCE(SUM(quantity), 0) as total_quantity_kg FROM food")
    
    # Request metrics
    request_stats = fetch_one("SELECT COUNT(*) as total_requests, SUM(CASE WHEN status='ACCEPTED' THEN 1 ELSE 0 END) as accepted_requests FROM food_requests")
    
    # Delivery metrics
    delivery_stats = fetch_one("SELECT COUNT(*) as total_deliveries, SUM(CASE WHEN status='DELIVERED' THEN 1 ELSE 0 END) as completed_deliveries FROM deliveries")
    
    # Average feedback rating
    rating_stats = fetch_one("SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_reviews FROM feedback")

    return jsonify({
        "status": "success",
        "statistics": {
            "users_by_role": {u['role']: u['count'] for u in user_counts},
            "total_food_listings": food_stats['total_food_listings'],
            "total_quantity_redistributed_kg": float(food_stats['total_quantity_kg']),
            "total_requests": request_stats['total_requests'],
            "accepted_requests": request_stats['accepted_requests'] or 0,
            "total_deliveries": delivery_stats['total_deliveries'],
            "completed_deliveries": delivery_stats['completed_deliveries'] or 0,
            "average_user_rating": round(float(rating_stats['average_rating']), 2),
            "total_reviews": rating_stats['total_reviews']
        }
    }), 200
