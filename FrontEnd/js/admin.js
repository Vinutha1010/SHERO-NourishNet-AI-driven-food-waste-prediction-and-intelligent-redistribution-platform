let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(['ADMIN']);
    if (!currentUser) return;

    document.getElementById('userName').innerText = currentUser.name;

    loadAdminStats();
    loadAdminUsers();
    loadAdminFood();
    loadAdminRequests();
    loadAdminDeliveries();
});

async function loadAdminStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/statistics`);
        const data = await res.json();
        
        if (data.status === 'success' && data.statistics) {
            const stats = data.statistics;
            document.getElementById('statFoodListings').innerText = stats.total_food_listings;
            document.getElementById('statFoodQty').innerText = `${stats.total_quantity_redistributed_kg} kg`;
            document.getElementById('statDeliveries').innerText = stats.completed_deliveries;
            document.getElementById('statRating').innerText = `${stats.average_user_rating} ★`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminUsers() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users`);
        const data = await res.json();
        const container = document.getElementById('adminUsersTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(u => `
                <tr>
                    <td>#${u.user_id}</td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.phone}</td>
                    <td><span class="role-badge">${u.role}</span></td>
                    <td>${u.address}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminFood() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/food`);
        const data = await res.json();
        const container = document.getElementById('adminFoodTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(f => `
                <tr>
                    <td>#${f.food_id}</td>
                    <td><strong>${f.food_name}</strong></td>
                    <td>${f.donor_name}</td>
                    <td>${f.quantity} kg</td>
                    <td>${f.expiry_time}</td>
                    <td><span class="status status-${f.status.toLowerCase()}">${f.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminRequests() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/requests`);
        const data = await res.json();
        const container = document.getElementById('adminRequestsTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(r => `
                <tr>
                    <td>#${r.request_id}</td>
                    <td><strong>${r.food_name}</strong></td>
                    <td>${r.ngo_name}</td>
                    <td>${r.donor_name}</td>
                    <td>${r.requested_quantity} kg</td>
                    <td><span class="status status-${r.status.toLowerCase()}">${r.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminDeliveries() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/deliveries`);
        const data = await res.json();
        const container = document.getElementById('adminDeliveriesTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(d => `
                <tr>
                    <td>#${d.delivery_id}</td>
                    <td><strong>${d.food_name}</strong></td>
                    <td>${d.volunteer_name}</td>
                    <td>${d.donor_name} ➔ ${d.ngo_name}</td>
                    <td><span class="status status-${d.status.toLowerCase()}">${d.status}</span></td>
                    <td>${d.started_at || 'N/A'}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}
