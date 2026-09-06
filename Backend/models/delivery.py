from db import fetch_one, fetch_all, execute_query
from datetime import datetime

class DeliveryModel:
    @staticmethod
    def create_delivery(request_id, volunteer_id):
        """
        Creates a new delivery assignment for a volunteer.
        """
        query = """
            INSERT INTO deliveries (request_id, volunteer_id, status, started_at)
            VALUES (%s, %s, 'ASSIGNED', NOW())
        """
        return execute_query(query, (request_id, volunteer_id))

    @staticmethod
    def get_all_deliveries(volunteer_id=None, status=None, request_id=None):
        """
        Fetches delivery records with complete JOIN details (Food, Donor, NGO, Volunteer).
        """
        query = """
            SELECT d.*, 
                   f.food_id, f.food_name, f.quantity, f.food_type, f.latitude as donor_lat, f.longitude as donor_lon,
                   donor.user_id as donor_id, donor.name as donor_name, donor.phone as donor_phone, donor.address as donor_address,
                   ngo.user_id as ngo_id, ngo.name as ngo_name, ngo.phone as ngo_phone, ngo.address as ngo_address, ngo.latitude as ngo_lat, ngo.longitude as ngo_lon,
                   vol.name as volunteer_name, vol.phone as volunteer_phone
            FROM deliveries d
            JOIN food_requests r ON d.request_id = r.request_id
            JOIN food f ON r.food_id = f.food_id
            JOIN users donor ON f.donor_id = donor.user_id
            JOIN users ngo ON r.ngo_id = ngo.user_id
            JOIN users vol ON d.volunteer_id = vol.user_id
            WHERE 1=1
        """
        params = []
        if volunteer_id:
            query += " AND d.volunteer_id = %s"
            params.append(volunteer_id)
        if status:
            query += " AND d.status = %s"
            params.append(status)
        if request_id:
            query += " AND d.request_id = %s"
            params.append(request_id)

        query += " ORDER BY d.started_at DESC"
        return fetch_all(query, params)

    @staticmethod
    def get_delivery_by_id(delivery_id):
        """
        Fetches single delivery details by delivery_id.
        """
        query = """
            SELECT d.*, r.food_id, r.ngo_id
            FROM deliveries d
            JOIN food_requests r ON d.request_id = r.request_id
            WHERE d.delivery_id = %s
        """
        return fetch_one(query, (delivery_id,))

    @staticmethod
    def update_delivery_status(delivery_id, status):
        """
        Updates delivery status (ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED).
        Sets completed_at timestamp when status becomes DELIVERED.
        """
        if status.upper() == 'DELIVERED':
            query = "UPDATE deliveries SET status = %s, completed_at = NOW() WHERE delivery_id = %s"
        else:
            query = "UPDATE deliveries SET status = %s WHERE delivery_id = %s"
        return execute_query(query, (status.upper(), delivery_id))
