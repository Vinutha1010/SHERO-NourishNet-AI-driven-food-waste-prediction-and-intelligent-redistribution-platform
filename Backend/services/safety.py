from datetime import datetime

class FoodSafetyService:
    """
    Rule-Based Food Safety Verification Engine.
    Evaluates food safety based on preparation timestamp, expiry timestamp,
    food item details, and storage instructions.
    """

    @staticmethod
    def check_food_safety(prepared_time_str, expiry_time_str, food_type="PERISHABLE", storage_condition="ROOM_TEMP"):
        """
        Evaluates food safety status using transparent rule-based logic.
        """
        try:
            # Parse datetime strings (Format: YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS)
            if 'T' in prepared_time_str:
                prepared_time = datetime.fromisoformat(prepared_time_str)
            else:
                prepared_time = datetime.strptime(prepared_time_str, "%Y-%m-%d %H:%M:%S")

            if 'T' in expiry_time_str:
                expiry_time = datetime.fromisoformat(expiry_time_str)
            else:
                expiry_time = datetime.strptime(expiry_time_str, "%Y-%m-%d %H:%M:%S")

            now = datetime.now()

            # Rule 1: Expiry timestamp check
            if now >= expiry_time:
                return {
                    "is_safe": False,
                    "safety_status": "EXPIRED",
                    "reason": "Food has passed its expiration time and cannot be redistributed.",
                    "hours_until_expiry": 0
                }

            # Calculate shelf-life metrics
            hours_until_expiry = round((expiry_time - now).total_seconds() / 3600, 2)
            hours_since_prepared = round((now - prepared_time).total_seconds() / 3600, 2)

            # Rule 2: Preparation time anomaly
            if hours_since_prepared < 0:
                return {
                    "is_safe": False,
                    "safety_status": "INVALID_TIMESTAMPS",
                    "reason": "Prepared time cannot be in the future.",
                    "hours_until_expiry": hours_until_expiry
                }

            # Rule 3: Prepared cooked food standard safety limit (e.g. > 12 hours at room temp is high risk)
            if storage_condition.upper() == "ROOM_TEMP" and hours_since_prepared > 12:
                return {
                    "is_safe": False,
                    "safety_status": "UNSAFE_STORAGE_DURATION",
                    "reason": f"Cooked food held at room temperature for over 12 hours ({hours_since_prepared} hrs elapsed) poses bacterial growth risks.",
                    "hours_until_expiry": hours_until_expiry
                }

            # Rule 4: Urgency classification
            if hours_until_expiry <= 3:
                safety_status = "URGENT_DISTRIBUTION_REQUIRED"
                reason = f"Safe for consumption, but expires within {hours_until_expiry} hours. Priority redistribution recommended."
            else:
                safety_status = "SAFE"
                reason = f"Food safety verified. {hours_until_expiry} hours remaining before expiration."

            return {
                "is_safe": True,
                "safety_status": safety_status,
                "reason": reason,
                "hours_since_prepared": hours_since_prepared,
                "hours_until_expiry": hours_until_expiry
            }

        except Exception as e:
            return {
                "is_safe": False,
                "safety_status": "VERIFICATION_ERROR",
                "reason": f"Failed to parse dates or verify food safety: {str(e)}",
                "hours_until_expiry": 0
            }
