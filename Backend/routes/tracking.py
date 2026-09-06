from flask import Blueprint, request, jsonify
from models.tracking import TrackingModel
from models.delivery import DeliveryModel

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/api/tracking', methods=['POST'])
def record_location():
    """
    POST /api/tracking
    Logs real-time GPS coordinates for an active delivery.
    """
    data = request.get_json() or {}
    delivery_id = data.get('delivery_id')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not all([delivery_id, latitude, longitude]):
        return jsonify({
            "status": "error",
            "message": "Missing required fields: delivery_id, latitude, longitude"
        }), 400

    delivery = DeliveryModel.get_delivery_by_id(delivery_id)
    if not delivery:
        return jsonify({"status": "error", "message": "Delivery record not found"}), 404

    try:
        tracking_id = TrackingModel.add_location(delivery_id, latitude, longitude)
        return jsonify({
            "status": "success",
            "message": "GPS coordinates logged successfully!",
            "tracking_id": tracking_id
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Tracking failed: {str(e)}"}), 500


@tracking_bp.route('/api/tracking/<int:delivery_id>', methods=['GET'])
def get_tracking_history(delivery_id):
    """
    GET /api/tracking/<delivery_id>
    Retrieves full GPS tracking route history for a delivery.
    """
    delivery = DeliveryModel.get_delivery_by_id(delivery_id)
    if not delivery:
        return jsonify({"status": "error", "message": "Delivery record not found"}), 404

    logs = TrackingModel.get_route_history(delivery_id)
    latest = TrackingModel.get_latest_location(delivery_id)

    return jsonify({
        "status": "success",
        "delivery_id": delivery_id,
        "current_status": delivery['status'],
        "latest_location": latest,
        "total_points": len(logs),
        "route_history": logs
    }), 200
