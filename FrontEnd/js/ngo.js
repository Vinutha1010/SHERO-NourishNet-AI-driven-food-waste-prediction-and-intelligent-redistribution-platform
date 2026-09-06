let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(['NGO']);
    if (!currentUser) return;

    document.getElementById('userName').innerText = currentUser.name;

    loadAvailableFood();
    loadNGORequests();
});

async function loadAvailableFood() {
    try {
        const res = await fetch(`${API_BASE_URL}/food?status=AVAILABLE`);
        const data = await res.json();
        const container = document.getElementById('foodGrid');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(item => `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <h3 style="font-size: 1.1rem; color: #fff;">${item.food_name}</h3>
                        <span class="status status-available">${item.status}</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem;">
                        Category: <strong>${item.food_type}</strong> | Quantity: <strong>${item.quantity} kg/meals</strong>
                    </p>
                    <div style="font-size: 0.85rem; color: var(--text-muted); background: rgba(15, 23, 42, 0.4); padding: 8px; border-radius: 8px; margin-bottom: 1rem;">
                        <div>📍 <strong>Donor:</strong> ${item.donor_name} (${item.donor_address})</div>
                        <div>⏳ <strong>Expires:</strong> ${item.expiry_time}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="flex: 1; font-size: 0.8rem;" onclick="checkSmartMatch(${item.food_id})">🧠 Smart Match Score</button>
                        <button class="btn btn-primary" style="flex: 1; font-size: 0.8rem;" onclick="requestFood(${item.food_id}, ${item.quantity})">📩 Request Food</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No available surplus food items right now. Check back soon!</div>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function checkSmartMatch(foodId) {
    try {
        const res = await fetch(`${API_BASE_URL}/matches/${foodId}`);
        const data = await res.json();
        
        if (data.status === 'success' && data.matches) {
            const myMatch = data.matches.find(m => m.ngo_id === currentUser.user_id) || data.matches[0];
            if (myMatch) {
                alert(`🧠 SMART DONOR-NGO MATCH SCORE RESULT:\n\nFood Item: ${data.food_name}\nDonor: ${data.donor_name}\n\nHaversine Distance: ${myMatch.distance_km} km\nTotal Match Score: ${myMatch.match_score_percentage}%\n\nScore Breakdown:\n- Distance (40%): ${myMatch.score_breakdown.distance_score_weighted}%\n- Quantity Match (20%): ${myMatch.score_breakdown.quantity_score_weighted}%\n- Food Type Compatibility (20%): ${myMatch.score_breakdown.type_score_weighted}%\n- Urgency Score (20%): ${myMatch.score_breakdown.urgency_score_weighted}%`);
            }
        }
    } catch (err) {
        alert(`Error calculating match score: ${err.message}`);
    }
}

async function requestFood(foodId, maxQty) {
    const qtyStr = prompt(`Enter requested quantity (Max available: ${maxQty} kg/meals):`, maxQty);
    if (qtyStr === null) return; // User cancelled
    
    const requested_quantity = parseFloat(qtyStr);
    if (isNaN(requested_quantity) || requested_quantity <= 0) {
        alert("Please enter a valid positive quantity.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                food_id: foodId,
                ngo_id: currentUser.user_id,
                requested_quantity: requested_quantity
            })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            showAlert('ngoAlert', `✅ Food request for ${data.request_id ? 'Request #' + data.request_id : 'item'} submitted successfully! Status: PENDING Donor approval.`, 'success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadAvailableFood();
            loadNGORequests();
        } else {
            showAlert('ngoAlert', `❌ Request failed: ${data.message || 'Error submitting request'}`, 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (err) {
        showAlert('ngoAlert', `❌ Connection Error: ${err.message}`, 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function loadNGORequests() {
    try {
        const res = await fetch(`${API_BASE_URL}/requests?ngo_id=${currentUser.user_id}`);
        const data = await res.json();
        const container = document.getElementById('ngoRequestsTable');

        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(req => `
                <tr>
                    <td>#${req.request_id}</td>
                    <td><strong>${req.food_name}</strong></td>
                    <td>${req.donor_name} (${req.donor_phone})</td>
                    <td>${req.requested_quantity} kg</td>
                    <td><span class="status status-${req.status.toLowerCase()}">${req.status}</span></td>
                    <td>${req.requested_at}</td>
                </tr>
            `).join('');
        } else {
            container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No requests placed yet.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}
