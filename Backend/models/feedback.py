from db import fetch_one, fetch_all, execute_query

class FeedbackModel:
    @staticmethod
    def create_feedback(delivery_id, from_user_id, rating, comment=None):
        """
        Creates a new feedback rating entry.
        """
        query = """
            INSERT INTO feedback (delivery_id, from_user_id, rating, comment)
            VALUES (%s, %s, %s, %s)
        """
        return execute_query(query, (delivery_id, from_user_id, rating, comment))

    @staticmethod
    def get_all_feedback(delivery_id=None, from_user_id=None):
        """
        Fetches feedback entries with user details.
        """
        query = """
            SELECT fb.*, u.name as from_user_name, u.role as from_user_role
            FROM feedback fb
            JOIN users u ON fb.from_user_id = u.user_id
            WHERE 1=1
        """
        params = []
        if delivery_id:
            query += " AND fb.delivery_id = %s"
            params.append(delivery_id)
        if from_user_id:
            query += " AND fb.from_user_id = %s"
            params.append(from_user_id)

        query += " ORDER BY fb.created_at DESC"
        return fetch_all(query, params)
