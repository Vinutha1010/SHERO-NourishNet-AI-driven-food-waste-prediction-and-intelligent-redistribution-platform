from db import fetch_one, fetch_all, execute_query

class FoodModel:
    @staticmethod
    def create_food(donor_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path=None, latitude=None, longitude=None):
        """
        Inserts a new surplus food listing into the MySQL food table.
        """
        query = """
            INSERT INTO food (donor_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path, latitude, longitude, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'AVAILABLE')
        """
        params = (donor_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path, latitude, longitude)
        return execute_query(query, params)

    @staticmethod
    def get_all_food(donor_id=None, status=None, food_type=None):
        """
        Fetches surplus food items with optional filtering by donor_id, status, or food_type.
        Includes donor name, phone, and address via JOIN.
        """
        query = """
            SELECT f.*, u.name as donor_name, u.phone as donor_phone, u.address as donor_address
            FROM food f
            JOIN users u ON f.donor_id = u.user_id
            WHERE 1=1
        """
        params = []
        if donor_id:
            query += " AND f.donor_id = %s"
            params.append(donor_id)
        if status:
            query += " AND f.status = %s"
            params.append(status)
        if food_type:
            query += " AND f.food_type = %s"
            params.append(food_type)

        query += " ORDER BY f.created_at DESC"
        return fetch_all(query, params)

    @staticmethod
    def get_food_by_id(food_id):
        """
        Fetches a single surplus food record by food_id with donor information.
        """
        query = """
            SELECT f.*, u.name as donor_name, u.phone as donor_phone, u.address as donor_address, u.email as donor_email
            FROM food f
            JOIN users u ON f.donor_id = u.user_id
            WHERE f.food_id = %s
        """
        return fetch_one(query, (food_id,))

    @staticmethod
    def update_food(food_id, food_name, food_type, quantity, prepared_time, expiry_time, image_path=None, status=None):
        """
        Updates an existing food record details.
        """
        query = """
            UPDATE food 
            SET food_name = %s, food_type = %s, quantity = %s, prepared_time = %s, expiry_time = %s, image_path = COALESCE(%s, image_path), status = COALESCE(%s, status)
            WHERE food_id = %s
        """
        params = (food_name, food_type, quantity, prepared_time, expiry_time, image_path, status, food_id)
        return execute_query(query, params)

    @staticmethod
    def update_status(food_id, status):
        """
        Updates status of food listing (AVAILABLE, RESERVED, DELIVERED, EXPIRED).
        """
        query = "UPDATE food SET status = %s WHERE food_id = %s"
        return execute_query(query, (status, food_id))

    @staticmethod
    def delete_food(food_id):
        """
        Deletes a food listing from the database.
        """
        query = "DELETE FROM food WHERE food_id = %s"
        return execute_query(query, (food_id,))
