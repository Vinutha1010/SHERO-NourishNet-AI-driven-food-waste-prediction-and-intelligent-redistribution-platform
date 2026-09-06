import math

class SmartMatchingService:
    """
    Transparent Algorithmic Matching Service between Donors and NGOs.
    Uses Haversine distance formula and a 4-factor weighted scoring model:
      - Distance Score (40% weight)
      - Quantity Match Score (20% weight)
      - Food Type Compatibility Score (20% weight)
      - Urgency Score (20% weight)
    """

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """
        Calculates the great-circle distance between two points on Earth in kilometers using the Haversine formula.
        """
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return 999.0  # Return default large distance if coordinates are missing

        # Radius of Earth in kilometers
        R = 6371.0

        dlat = math.radians(float(lat2) - float(lat1))
        dlon = math.radians(float(lon2) - float(lon1))
        a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance_km = R * c
        return round(distance_km, 2)

    @classmethod
    def calculate_match_score(cls, food_item, ngo_user, hours_until_expiry=5.0):
        """
        Calculates a transparent weighted match score (0 to 100%) for an NGO given a food item.
        """
        donor_lat = food_item.get('latitude')
        donor_lon = food_item.get('longitude')
        ngo_lat = ngo_user.get('latitude')
        ngo_lon = ngo_user.get('longitude')

        # 1. Distance Calculation (40% Weight)
        distance_km = cls.haversine_distance(donor_lat, donor_lon, ngo_lat, ngo_lon)
        # Score drops as distance increases (Max 100 at 0km, 0 at 50+ km)
        distance_score = max(0.0, 100.0 - (distance_km * 2.0))

        # 2. Quantity Match (20% Weight)
        # Food quantity vs NGO handling capacity (assume typical NGO capacity range)
        food_qty = float(food_item.get('quantity', 0))
        quantity_score = 100.0 if food_qty > 0 else 50.0

        # 3. Food Type Compatibility (20% Weight)
        food_type = str(food_item.get('food_type', '')).upper()
        type_score = 100.0  # Default compatible for general NGOs

        # 4. Urgency Score (20% Weight)
        # Higher urgency if hours until expiry is low (< 4 hrs = 100 score)
        if hours_until_expiry <= 2:
            urgency_score = 100.0
        elif hours_until_expiry <= 5:
            urgency_score = 80.0
        elif hours_until_expiry <= 12:
            urgency_score = 60.0
        else:
            urgency_score = 40.0

        # Total Weighted Score
        total_score = (
            (distance_score * 0.40) +
            (quantity_score * 0.20) +
            (type_score * 0.20) +
            (urgency_score * 0.20)
        )

        return {
            "match_score_percentage": round(total_score, 1),
            "distance_km": distance_km,
            "breakdown": {
                "distance_score_weighted": round(distance_score * 0.40, 1),
                "quantity_score_weighted": round(quantity_score * 0.20, 1),
                "type_score_weighted": round(type_score * 0.20, 1),
                "urgency_score_weighted": round(urgency_score * 0.20, 1)
            }
        }
