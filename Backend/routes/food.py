from flask import Blueprint, request, jsonify
from models.food import FoodModel
from services.safety import FoodSafetyService
from services.auth_middleware import role_required

food_bp = Blueprint('food', __name__)

@food_bp.route('/api/food', methods=['POST'])
def add_food():
    """
    POST /api/food
    Donors add surplus food listing. Integrates rule-based food safety verification.
    """
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Missing JSON payload"}), 400

    donor_id = data.get('donor_id')
    food_name = data.get('food_name')
    food_type = data.get('food_type')
    quantity = data.get('quantity')
    prepared_time = data.get('prepared_time')
    expiry_time = data.get('expiry_time')
    image_path = data.get('image_path')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    storage_condition = data.get('storage_condition', 'ROOM_TEMP')

    if not all([donor_id, food_name, food_type, quantity, prepared_time, expiry_time]):
        return jsonify({
            "status": "error",
            "message": "Missing required fields: donor_id, food_name, food_type, quantity, prepared_time, expiry_time"
        }), 400

    # Execute Rule-Based Food Safety Check
    safety_check = FoodSafetyService.check_food_safety(
        prepared_time, expiry_time, food_type, storage_condition
    )

    if not safety_check['is_safe']:
        return jsonify({
            "status": "error",
            "message": f"Food listing rejected by Safety Check: {safety_check['reason']}",
            "safety_check": safety_check
        }), 400

    try:
        food_id = FoodModel.create_food(
            donor_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path, latitude, longitude
        )
        return jsonify({
            "status": "success",
            "message": "Surplus food listed successfully!",
            "food_id": food_id,
            "safety_check": safety_check
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to list food: {str(e)}"}), 500


@food_bp.route('/api/food', methods=['GET'])
def get_all_food():
    """
    GET /api/food
    Retrieves food listings with optional query parameters (?donor_id=1&status=AVAILABLE&food_type=Cooked)
    """
    donor_id = request.args.get('donor_id')
    status = request.args.get('status')
    food_type = request.args.get('food_type')

    food_list = FoodModel.get_all_food(donor_id, status, food_type)
    return jsonify({
        "status": "success",
        "count": len(food_list),
        "data": food_list
    }), 200


@food_bp.route('/api/food/<int:food_id>', methods=['GET'])
def get_food(food_id):
    """
    GET /api/food/<id>
    Fetches single food listing details with donor info and live safety check.
    """
    food = FoodModel.get_food_by_id(food_id)
    if not food:
        return jsonify({"status": "error", "message": "Food listing not found"}), 404

    # Perform live safety check against current time
    safety_check = FoodSafetyService.check_food_safety(
        str(food['prepared_time']), str(food['expiry_time']), food['food_type']
    )
    food['safety_check'] = safety_check

    return jsonify({"status": "success", "data": food}), 200


@food_bp.route('/api/food/<int:food_id>', methods=['PUT'])
def update_food(food_id):
    """
    PUT /api/food/<id>
    Updates food details or status.
    """
    food = FoodModel.get_food_by_id(food_id)
    if not food:
        return jsonify({"status": "error", "message": "Food listing not found"}), 404

    data = request.get_json() or {}
    food_name = data.get('food_name', food['food_name'])
    food_type = data.get('food_type', food['food_type'])
    quantity = data.get('quantity', food['quantity'])
    prepared_time = str(data.get('prepared_time', food['prepared_time']))
    expiry_time = str(data.get('expiry_time', food['expiry_time']))
    image_path = data.get('image_path', food['image_path'])
    status = data.get('status', food['status'])

    try:
        FoodModel.update_food(food_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path, status)
        return jsonify({"status": "success", "message": "Food listing updated successfully!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Update failed: {str(e)}"}), 500


@food_bp.route('/api/food/<int:food_id>', methods=['DELETE'])
def delete_food(food_id):
    """
    DELETE /api/food/<id>
    Deletes a surplus food listing.
    """
    food = FoodModel.get_food_by_id(food_id)
    if not food:
        return jsonify({"status": "error", "message": "Food listing not found"}), 404

    try:
        FoodModel.delete_food(food_id)
        return jsonify({"status": "success", "message": "Food listing deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Delete failed: {str(e)}"}), 500


@food_bp.route('/api/food/predict', methods=['POST'])
def predict_surplus():
    """
    POST /api/food/predict
    AI Surplus Food Waste Prediction based on event type, guest count, and day of week.
    """
    from ml.prediction import SurplusPredictionModel
    data = request.get_json() or {}
    day_of_week = data.get('day_of_week', 'Saturday')
    event_type = data.get('event_type', 'Buffet')
    estimated_guests = data.get('estimated_guests', 100)

    try:
        predictor = SurplusPredictionModel()
        result = predictor.predict_surplus(day_of_week, event_type, estimated_guests)
        return jsonify({
            "status": "success",
            "prediction": result
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Prediction failed: {str(e)}"}), 500


@food_bp.route('/api/food/classify', methods=['POST'])
def classify_food_image():
    """
    POST /api/food/classify
    AI Food Image Recognition & Freshness Inspection heuristic.
    """
    from ml.image_recognition import FoodImageRecognition
    data = request.get_json() or {}
    image_path = data.get('image_path', 'food_sample.jpg')

    try:
        result = FoodImageRecognition.classify_image(image_path)
        return jsonify({
            "status": "success",
            "classification": result
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Classification failed: {str(e)}"}), 500

