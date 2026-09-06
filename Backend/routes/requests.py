from flask import Blueprint, request, jsonify
from models.request import RequestModel
from models.food import FoodModel

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/api/requests', methods=['POST'])
def create_request():
    """
    POST /api/requests
    NGO submits request for surplus food item.
    """
    data = request.get_json() or {}
    food_id = data.get('food_id')
    ngo_id = data.get('ngo_id')
    requested_quantity = data.get('requested_quantity')

    if not all([food_id, ngo_id, requested_quantity]):
        return jsonify({
            "status": "error",
            "message": "Missing required fields: food_id, ngo_id, requested_quantity"
        }), 400

    # Verify food listing exists and is available
    food = FoodModel.get_food_by_id(food_id)
    if not food:
        return jsonify({"status": "error", "message": "Food listing not found"}), 404

    if food['status'] != 'AVAILABLE':
        return jsonify({
            "status": "error",
            "message": f"Food item is currently '{food['status']}' and unavailable for new requests"
        }), 400

    try:
        request_id = RequestModel.create_request(food_id, ngo_id, requested_quantity)
        return jsonify({
            "status": "success",
            "message": "Food request submitted successfully! Pending donor approval.",
            "request_id": request_id
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to submit request: {str(e)}"}), 500


@requests_bp.route('/api/requests', methods=['GET'])
def get_requests():
    """
    GET /api/requests
    Retrieves food requests with optional query filters (?ngo_id=2&donor_id=1&status=PENDING)
    """
    ngo_id = request.args.get('ngo_id')
    donor_id = request.args.get('donor_id')
    status = request.args.get('status')

    requests_list = RequestModel.get_all_requests(ngo_id, donor_id, status)
    return jsonify({
        "status": "success",
        "count": len(requests_list),
        "data": requests_list
    }), 200


@requests_bp.route('/api/requests/<int:request_id>/accept', methods=['PUT'])
def accept_request(request_id):
    """
    PUT /api/requests/<id>/accept
    Donor accepts an NGO request. Updates request status to ACCEPTED and food to RESERVED.
    """
    req_item = RequestModel.get_request_by_id(request_id)
    if not req_item:
        return jsonify({"status": "error", "message": "Request not found"}), 404

    try:
        # Update request status to ACCEPTED
        RequestModel.update_request_status(request_id, 'ACCEPTED')
        # Update food item status to RESERVED
        FoodModel.update_status(req_item['food_id'], 'RESERVED')

        return jsonify({
            "status": "success",
            "message": f"Request #{request_id} accepted! Food status updated to RESERVED for NGO '{req_item['ngo_name']}'."
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to accept request: {str(e)}"}), 500


@requests_bp.route('/api/requests/<int:request_id>/reject', methods=['PUT'])
def reject_request(request_id):
    """
    PUT /api/requests/<id>/reject
    Donor rejects an NGO request. Updates request status to REJECTED.
    """
    req_item = RequestModel.get_request_by_id(request_id)
    if not req_item:
        return jsonify({"status": "error", "message": "Request not found"}), 404

    try:
        RequestModel.update_request_status(request_id, 'REJECTED')
        return jsonify({
            "status": "success",
            "message": f"Request #{request_id} rejected."
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to reject request: {str(e)}"}), 500
