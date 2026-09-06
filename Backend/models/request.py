from db import fetch_one, fetch_all, execute_query

class RequestModel:
    @staticmethod
    def create_request(food_id, ngo_id, requested_quantity):
        """
        Creates a new NGO food request in food_requests table.
        """
        query = """
            INSERT INTO food_requests (food_id, ngo_id, requested_quantity, status)
            VALUES (%s, %s, %s, 'PENDING')
        """
        return execute_query(query, (food_id, ngo_id, requested_quantity))

    @staticmethod
    def get_all_requests(ngo_id=None, donor_id=None, status=None):
        """
        Fetches requests with joins on food and users tables for complete details.
        """
        query = """
            SELECT r.*, f.food_name, f.food_type, f.quantity as total_food_quantity, f.prepared_time, f.expiry_time, f.status as food_status,
                   ngo.name as ngo_name, ngo.phone as ngo_phone, ngo.email as ngo_email, ngo.address as ngo_address,
                   donor.user_id as donor_id, donor.name as donor_name, donor.phone as donor_phone
            FROM food_requests r
            JOIN food f ON r.food_id = f.food_id
            JOIN users ngo ON r.ngo_id = ngo.user_id
            JOIN users donor ON f.donor_id = donor.user_id
            WHERE 1=1
        """
        params = []
        if ngo_id:
            query += " AND r.ngo_id = %s"
            params.append(ngo_id)
        if donor_id:
            query += " AND f.donor_id = %s"
            params.append(donor_id)
        if status:
            query += " AND r.status = %s"
            params.append(status)

        query += " ORDER BY r.requested_at DESC"
        return fetch_all(query, params)

    @staticmethod
    def get_request_by_id(request_id):
        """
        Fetches a single request details by request_id.
        """
        query = """
            SELECT r.*, f.food_name, f.donor_id, f.status as food_status, ngo.name as ngo_name
            FROM food_requests r
            JOIN food f ON r.food_id = f.food_id
            JOIN users ngo ON r.ngo_id = ngo.user_id
            WHERE r.request_id = %s
        """
        return fetch_one(query, (request_id,))

    @staticmethod
    def update_request_status(request_id, status):
        """
        Updates request status (PENDING, ACCEPTED, REJECTED, COMPLETED).
        """
        query = "UPDATE food_requests SET status = %s WHERE request_id = %s"
        return execute_query(query, (status, request_id))
