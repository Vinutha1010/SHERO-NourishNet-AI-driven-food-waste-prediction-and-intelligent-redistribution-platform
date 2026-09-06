from flask import Blueprint, jsonify
from models.food import FoodModel
from db import fetch_all
from services.matching import SmartMatchingService
from services.safety import FoodSafetyService

matching_bp = Blueprint('matching', __name__)

@matching_bp.route('/api/matches/<int:food_id>', methods=['GET'])
def get_smart_matches(food_id):
    """
    GET /api/matches/<food_id>
    Calculates transparent weighted match scores between the donor food item and all registered NGOs.
    """
    food = FoodModel.get_food_by_id(food_id)
    if not food:
        return jsonify({"status": "error", "message": "Food listing not found"}), 404

    # Calculate hours until expiry
    safety_check = FoodSafetyService.check_food_safety(
        str(food['prepared_time']), str(food['expiry_time']), food['food_type']
    )
    hours_until_expiry = safety_check.get('hours_until_expiry', 5.0)

    # Fetch all registered NGOs
    query = "SELECT user_id, name, email, phone, address, latitude, longitude FROM users WHERE role = 'NGO'"
    ngo_users = fetch_all(query)

    if not ngo_users:
        return jsonify({
            "status": "success",
            "message": "No registered NGOs found in the system.",
            "data": []
        }), 200

    matches = []
    for ngo in ngo_users:
        match_result = SmartMatchingService.calculate_match_score(food, ngo, hours_until_expiry)
        matches.append({
            "ngo_id": ngo['user_id'],
            "ngo_name": ngo['name'],
            "ngo_email": ngo['email'],
            "ngo_phone": ngo['phone'],
            "ngo_address": ngo['address'],
            "distance_km": match_result['distance_km'],
            "match_score_percentage": match_result['match_score_percentage'],
            "score_breakdown": match_result['breakdown']
        })

    # Sort matches by highest match score percentage descending
    matches.sort(key=lambda x: x['match_score_percentage'], reverse=True)

    return jsonify({
        "status": "success",
        "food_id": food_id,
        "food_name": food['food_name'],
        "donor_name": food['donor_name'],
        "total_ngos_evaluated": len(matches),
        "matches": matches
    }), 200
