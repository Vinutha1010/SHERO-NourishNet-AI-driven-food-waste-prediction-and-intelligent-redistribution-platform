const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper to get active user session from LocalStorage
function getActiveUser() {
    const userStr = localStorage.getItem('shero_user');
    return userStr ? JSON.parse(userStr) : None;
}

// Helper to check user authorization & role redirection
function requireAuth(allowedRoles = []) {
    const userStr = localStorage.getItem('shero_user');
    if (!userStr) {
        window.location.href = 'index.html';
        return null;
    }
    const user = JSON.parse(userStr);
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        alert(`Access Denied. Role '${user.role}' is not authorized to view this page.`);
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Helper to logout
function logout() {
    localStorage.removeItem('shero_user');
    window.location.href = 'index.html';
}

// Display UI Alert
function showAlert(elementId, message, type = 'success') {
    const el = document.getElementById(elementId);
    if (el) {
        el.className = `alert alert-${type}`;
        el.innerText = message;
        el.style.display = 'block';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            el.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}
