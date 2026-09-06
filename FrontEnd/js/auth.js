document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Registration Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Registering...";

            const payload = {
                name: document.getElementById('reg_name').value,
                email: document.getElementById('reg_email').value,
                password: document.getElementById('reg_password').value,
                phone: document.getElementById('reg_phone').value,
                role: document.getElementById('reg_role').value,
                address: document.getElementById('reg_address').value,
                latitude: parseFloat(document.getElementById('reg_lat').value) || 12.9716,
                longitude: parseFloat(document.getElementById('reg_lng').value) || 77.5946
            };

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const resData = await response.json();

                if (response.ok && resData.status === 'success') {
                    showAlert('authAlert', 'Registration successful! Please login.', 'success');
                    registerForm.reset();
                    switchTab('login');
                } else {
                    showAlert('authAlert', resData.message || 'Registration failed', 'error');
                }
            } catch (err) {
                showAlert('authAlert', `Server connection error: ${err.message}`, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Register Account";
            }
        });
    }

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Logging in...";

            const payload = {
                email: document.getElementById('login_email').value,
                password: document.getElementById('login_password').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const resData = await response.json();

                if (response.ok && resData.status === 'success') {
                    // Save user to local storage
                    localStorage.setItem('shero_user', JSON.stringify(resData.user));
                    
                    showAlert('authAlert', `Welcome ${resData.user.name}! Redirecting...`, 'success');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        const role = resData.user.role.toUpperCase();
                        if (role === 'DONOR') window.location.href = 'donor.html';
                        else if (role === 'NGO') window.location.href = 'ngo.html';
                        else if (role === 'VOLUNTEER') window.location.href = 'volunteer.html';
                        else if (role === 'ADMIN') window.location.href = 'admin.html';
                        else window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showAlert('authAlert', resData.message || 'Invalid credentials', 'error');
                }
            } catch (err) {
                showAlert('authAlert', `Server connection error: ${err.message}`, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In";
            }
        });
    }
});

// UI Helper to switch between Login and Register tabs
function switchTab(tab) {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (tab === 'login') {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
        tabLogin.classList.add('btn-primary');
        tabLogin.classList.remove('btn-secondary');
        tabRegister.classList.add('btn-secondary');
        tabRegister.classList.remove('btn-primary');
    } else {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
        tabRegister.classList.add('btn-primary');
        tabRegister.classList.remove('btn-secondary');
        tabLogin.classList.add('btn-secondary');
        tabLogin.classList.remove('btn-primary');
    }
}

// Geolocation helper
function getGPSLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            document.getElementById('reg_lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('reg_lng').value = pos.coords.longitude.toFixed(6);
            alert("Current GPS coordinates updated!");
        }, () => {
            alert("Unable to fetch location automatically. Using default coordinates.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}
