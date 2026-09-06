from flask import Blueprint, request, jsonify
from models.delivery import DeliveryModel
from models.request import RequestModel
from models.food import FoodModel

delivery_bp = Blueprint('delivery', __name__)

VALID_STATUSES = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']

@delivery_bp.route('/api/deliveries', methods=['POST'])
def create_delivery():
    """
    POST /api/deliveries
    Assigns a volunteer to transport an accepted food request.
    """
    data = request.get_json() or {}
    request_id = data.get('request_id')
    volunteer_id = data.get('volunteer_id')

    if not request_id or not volunteer_id:
        return jsonify({
            "status": "error",
            "message": "request_id and volunteer_id are required"
        }), 400

    req_item = RequestModel.get_request_by_id(request_id)
    if not req_item:
        return jsonify({"status": "error", "message": "Request not found"}), 404

    if req_item['status'] != 'ACCEPTED':
        return jsonify({
            "status": "error",
            "message": f"Cannot assign delivery. Request status is '{req_item['status']}' (Must be 'ACCEPTED')"
        }), 400

    try:
        delivery_id = DeliveryModel.create_delivery(request_id, volunteer_id)
        return jsonify({
            "status": "success",
            "message": f"Volunteer successfully assigned to Delivery #{delivery_id}!",
            "delivery_id": delivery_id
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Delivery creation failed: {str(e)}"}), 500


@delivery_bp.route('/api/deliveries', methods=['GET'])
def get_deliveries():
    """
    GET /api/deliveries
    Retrieves delivery list with optional query parameters (?volunteer_id=3&status=IN_TRANSIT)
    """
    volunteer_id = request.args.get('volunteer_id')
    status = request.args.get('status')
    request_id = request.args.get('request_id')

    deliveries = DeliveryModel.get_all_deliveries(volunteer_id, status, request_id)
    return jsonify({
        "status": "success",
        "count": len(deliveries),
        "data": deliveries
    }), 200


@delivery_bp.route('/api/deliveries/<int:delivery_id>/status', methods=['PUT'])
def update_delivery_status(delivery_id):
    """
    PUT /api/deliveries/<id>/status
    Updates delivery progression status (ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED).
    """
    delivery = DeliveryModel.get_delivery_by_id(delivery_id)
    if not delivery:
        return jsonify({"status": "error", "message": "Delivery record not found"}), 404

    data = request.get_json() or {}
    new_status = str(data.get('status', '')).upper()

    if new_status not in VALID_STATUSES:
        return jsonify({
            "status": "error",
            "message": f"Invalid status. Allowed values: {', '.join(VALID_STATUSES)}"
        }), 400

    try:
        DeliveryModel.update_delivery_status(delivery_id, new_status)

        # If delivery completed, update Food to DELIVERED and Request to COMPLETED
        if new_status == 'DELIVERED':
            FoodModel.update_status(delivery['food_id'], 'DELIVERED')
            RequestModel.update_request_status(delivery['request_id'], 'COMPLETED')

        return jsonify({
            "status": "success",
            "message": f"Delivery #{delivery_id} status updated to '{new_status}'!"
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Status update failed: {str(e)}"}), 500
