let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(['DONOR']);
    if (!currentUser) return;

    // Display user profile info
    document.getElementById('userName').innerText = currentUser.name;

    // Set default prep and expiry time strings
    const now = new Date();
    const expiry = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // +8 hours
    document.getElementById('prepared_time').value = formatDateForInput(now);
    document.getElementById('expiry_time').value = formatDateForInput(expiry);

    // Initial load
    loadDonorFood();
    loadDonorRequests();

    // Add Food Form Handler
    document.getElementById('addFoodForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const payload = {
            donor_id: currentUser.user_id,
            food_name: document.getElementById('food_name').value,
            food_type: document.getElementById('food_type').value,
            quantity: parseFloat(document.getElementById('quantity').value),
            prepared_time: document.getElementById('prepared_time').value.replace('T', ' ') + ':00',
            expiry_time: document.getElementById('expiry_time').value.replace('T', ' ') + ':00',
            storage_condition: document.getElementById('storage_condition').value,
            image_path: 'uploads/food_images/default.jpg',
            latitude: currentUser.latitude || 12.9716,
            longitude: currentUser.longitude || 77.5946
        };

        try {
            const response = await fetch(`${API_BASE_URL}/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resData = await response.json();

            if (response.ok && resData.status === 'success') {
                showAlert('donorAlert', `Food listed successfully! Safety Status: ${resData.safety_check.safety_status}`, 'success');
                document.getElementById('addFoodForm').reset();
                loadDonorFood();
            } else {
                showAlert('donorAlert', resData.message || 'Failed to list food', 'error');
            }
        } catch (err) {
            showAlert('donorAlert', `Server connection error: ${err.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });
});

async function loadDonorFood() {
    try {
        const res = await fetch(`${API_BASE_URL}/food?donor_id=${currentUser.user_id}`);
        const data = await res.json();
        const container = document.getElementById('donorFoodTable');
        
        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(item => `
                <tr>
                    <td>#${item.food_id}</td>
                    <td><strong>${item.food_name}</strong></td>
                    <td>${item.food_type}</td>
                    <td>${item.quantity} kg/meals</td>
                    <td>${item.expiry_time}</td>
                    <td><span class="status status-${item.status.toLowerCase()}">${item.status}</span></td>
                </tr>
            `).join('');
        } else {
            container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No food items listed yet.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

let volunteersList = [];

async function loadVolunteers() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users?role=VOLUNTEER`);
        const data = await res.json();
        if (data.data) volunteersList = data.data;
    } catch (err) {
        console.error(err);
    }
}

async function loadDonorRequests() {
    await loadVolunteers();
    try {
        const res = await fetch(`${API_BASE_URL}/requests?donor_id=${currentUser.user_id}`);
        const data = await res.json();
        const container = document.getElementById('donorRequestsTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(req => `
                <tr>
                    <td>#${req.request_id}</td>
                    <td><strong>${req.food_name}</strong></td>
                    <td>${req.ngo_name} (${req.ngo_phone})</td>
                    <td>${req.requested_quantity} kg</td>
                    <td><span class="status status-${req.status.toLowerCase()}">${req.status}</span></td>
                    <td>
                        ${req.status === 'PENDING' ? `
                            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="handleRequest(${req.request_id}, 'accept')">Accept</button>
                            <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="handleRequest(${req.request_id}, 'reject')">Reject</button>
                        ` : req.status === 'ACCEPTED' ? `
                            <div style="display: flex; gap: 4px; align-items: center;">
                                <select id="vol_select_${req.request_id}" class="form-control" style="padding: 4px; font-size: 0.8rem; width: 140px;">
                                    ${volunteersList.length > 0 ? volunteersList.map(v => `<option value="${v.user_id}">${v.name}</option>`).join('') : '<option value="">No Volunteers</option>'}
                                </select>
                                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="assignVolunteer(${req.request_id})">Assign</button>
                            </div>
                        ` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Processed</span>'}
                    </td>
                </tr>
            `).join('');
        } else {
            container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No incoming requests.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function assignVolunteer(requestId) {
    const volSelect = document.getElementById(`vol_select_${requestId}`);
    if (!volSelect || !volSelect.value) {
        alert("Please select a volunteer from the dropdown first (Make sure a volunteer account is registered).");
        return;
    }
    const volunteerId = parseInt(volSelect.value);

    try {
        const res = await fetch(`${API_BASE_URL}/deliveries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId, volunteer_id: volunteerId })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            showAlert('donorAlert', `✅ Volunteer assigned to Delivery #${data.delivery_id}! Status: ASSIGNED`, 'success');
            loadDonorRequests();
        } else {
            showAlert('donorAlert', `❌ Assignment failed: ${data.message}`, 'error');
        }
    } catch (err) {
        showAlert('donorAlert', `Error: ${err.message}`, 'error');
    }
}

async function handleRequest(requestId, action) {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${requestId}/${action}`, { method: 'PUT' });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            showAlert('donorAlert', data.message, 'success');
            loadDonorRequests();
            loadDonorFood();
        } else {
            showAlert('donorAlert', data.message || 'Action failed', 'error');
        }
    } catch (err) {
        showAlert('donorAlert', `Error: ${err.message}`, 'error');
    }
}

function formatDateForInput(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
