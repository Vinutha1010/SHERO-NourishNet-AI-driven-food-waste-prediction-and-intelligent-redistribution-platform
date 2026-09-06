from flask import Blueprint, request, jsonify
from models.feedback import FeedbackModel
from models.delivery import DeliveryModel

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/api/feedback', methods=['POST'])
def add_feedback():
    """
    POST /api/feedback
    Submits a star rating (1 to 5) and review comment for a completed delivery.
    """
    data = request.get_json() or {}
    delivery_id = data.get('delivery_id')
    from_user_id = data.get('from_user_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not all([delivery_id, from_user_id, rating]):
        return jsonify({
            "status": "error",
            "message": "Missing required fields: delivery_id, from_user_id, rating"
        }), 400

    try:
        rating_int = int(rating)
        if rating_int < 1 or rating_int > 5:
            return jsonify({"status": "error", "message": "Rating must be between 1 and 5"}), 400
    except ValueError:
        return jsonify({"status": "error", "message": "Rating must be an integer (1 to 5)"}), 400

    delivery = DeliveryModel.get_delivery_by_id(delivery_id)
    if not delivery:
        return jsonify({"status": "error", "message": "Delivery record not found"}), 404

    try:
        feedback_id = FeedbackModel.create_feedback(delivery_id, from_user_id, rating_int, comment)
        return jsonify({
            "status": "success",
            "message": "Thank you! Your feedback has been submitted successfully.",
            "feedback_id": feedback_id
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Feedback submission failed: {str(e)}"}), 500


@feedback_bp.route('/api/feedback', methods=['GET'])
def get_feedback():
    """
    GET /api/feedback
    Retrieves feedback entries with optional query filters (?delivery_id=1&from_user_id=2)
    """
    delivery_id = request.args.get('delivery_id')
    from_user_id = request.args.get('from_user_id')

    feedback_list = FeedbackModel.get_all_feedback(delivery_id, from_user_id)
    return jsonify({
        "status": "success",
        "count": len(feedback_list),
        "data": feedback_list
    }), 200
