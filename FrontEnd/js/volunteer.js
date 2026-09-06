let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(['VOLUNTEER']);
    if (!currentUser) return;

    document.getElementById('userName').innerText = currentUser.name;

    loadVolunteerDeliveries();
});

async function loadVolunteerDeliveries() {
    try {
        const res = await fetch(`${API_BASE_URL}/deliveries?volunteer_id=${currentUser.user_id}`);
        const data = await res.json();
        const container = document.getElementById('volunteerDeliveriesTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(del => `
                <tr>
                    <td>#${del.delivery_id}</td>
                    <td><strong>${del.food_name}</strong> (${del.quantity} kg)</td>
                    <td>📍 <strong>Pickup:</strong> ${del.donor_name} (${del.donor_address})</td>
                    <td>📍 <strong>Drop:</strong> ${del.ngo_name} (${del.ngo_address})</td>
                    <td><span class="status status-${del.status.toLowerCase()}">${del.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            ${del.status === 'ASSIGNED' ? `<button class="btn btn-primary" style="padding: 3px 8px; font-size: 0.75rem;" onclick="updateStatus(${del.delivery_id}, 'PICKED_UP')">Mark Picked Up</button>` : ''}
                            ${del.status === 'PICKED_UP' ? `<button class="btn btn-primary" style="padding: 3px 8px; font-size: 0.75rem;" onclick="updateStatus(${del.delivery_id}, 'IN_TRANSIT')">Mark In Transit</button>` : ''}
                            ${del.status === 'IN_TRANSIT' ? `<button class="btn btn-primary" style="padding: 3px 8px; font-size: 0.75rem;" onclick="updateStatus(${del.delivery_id}, 'DELIVERED')">Mark Delivered</button>` : ''}
                            ${del.status !== 'DELIVERED' ? `<button class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.75rem;" onclick="sendGPSUpdate(${del.delivery_id})">📡 Send Live GPS</button>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Completed</span>'}
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No active delivery assignments.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function updateStatus(deliveryId, newStatus) {
    try {
        const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            showAlert('volunteerAlert', data.message, 'success');
            loadVolunteerDeliveries();
        } else {
            showAlert('volunteerAlert', data.message || 'Status update failed', 'error');
        }
    } catch (err) {
        showAlert('volunteerAlert', `Error: ${err.message}`, 'error');
    }
}

async function sendGPSUpdate(deliveryId) {
    // Simulate live GPS movement
    const lat = (12.9716 + (Math.random() * 0.01)).toFixed(6);
    const lng = (77.5946 + (Math.random() * 0.01)).toFixed(6);

    try {
        const res = await fetch(`${API_BASE_URL}/tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                delivery_id: deliveryId,
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            alert(`📡 Live GPS Updated to MySQL!\n\nLatitude: ${lat}\nLongitude: ${lng}\nTimestamp: ${new Date().toLocaleTimeString()}`);
        } else {
            alert(data.message || "GPS update failed");
        }
    } catch (err) {
        alert(`GPS Error: ${err.message}`);
    }
}
