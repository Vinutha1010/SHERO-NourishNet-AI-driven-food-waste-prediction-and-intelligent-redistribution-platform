from db import fetch_all, execute_query

class TrackingModel:
    @staticmethod
    def add_location(delivery_id, latitude, longitude):
        """
        Inserts real-time GPS coordinates for an active delivery.
        """
        query = """
            INSERT INTO tracking (delivery_id, latitude, longitude)
            VALUES (%s, %s, %s)
        """
        return execute_query(query, (delivery_id, latitude, longitude))

    @staticmethod
    def get_route_history(delivery_id):
        """
        Retrieves full GPS tracking logs for a delivery ordered chronologically.
        """
        query = """
            SELECT tracking_id, delivery_id, latitude, longitude, recorded_at
            FROM tracking
            WHERE delivery_id = %s
            ORDER BY recorded_at ASC
        """
        return fetch_all(query, (delivery_id,))

    @staticmethod
    def get_latest_location(delivery_id):
        """
        Retrieves the most recent GPS location update for a delivery.
        """
        query = """
            SELECT tracking_id, delivery_id, latitude, longitude, recorded_at
            FROM tracking
            WHERE delivery_id = %s
            ORDER BY recorded_at DESC
            LIMIT 1
        """
        from db import fetch_one
        return fetch_one(query, (delivery_id,))
