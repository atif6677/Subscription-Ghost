// PUBLIC/JS/login.js

// 1. Get Elements
const loginBox = document.getElementById('login-box');
const forgotBox = document.getElementById('forgot-box');
const showForgotBtn = document.getElementById('show-forgot');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('loginForm');
const forgotForm = document.getElementById('forgotForm');
const errorDiv = document.getElementById('error-message');

// 2. Toggle Logic
if(showForgotBtn) {
    showForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(loginBox && forgotBox) {
            loginBox.style.display = 'none';
            forgotBox.style.display = 'block';
            if(errorDiv) errorDiv.style.display = 'none'; // Clear errors
        }
    });
}

if(showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(loginBox && forgotBox) {
            forgotBox.style.display = 'none';
            loginBox.style.display = 'block';
            if(errorDiv) errorDiv.style.display = 'none'; // Clear errors
        }
    });
}

// 3. Login Logic
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Clear previous error
        if(errorDiv) errorDiv.style.display = 'none';

        try {
            // Match Backend Route
            const res = await axios.post('/login', { email, password });
            
            // Save Token
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Redirect
            window.location.href = '/home.html'; 
            
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Login Failed';
            
            if(errorDiv) {
                errorDiv.innerText = msg;
                errorDiv.style.display = 'block';
            } else {
                alert(msg);
            }
        }
    });
}

// 4. Forgot Password Logic
if(forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('forgot-email').value;
        
        try {
            // Match Backend Route: /password/forgotpassword
            const res = await axios.post('/password/forgotpassword', { email });
            alert(res.data.message || 'Reset link sent!');
            
            // Switch back to login
            forgotBox.style.display = 'none';
            loginBox.style.display = 'block';
            
        } catch (err) {
            alert(err.response?.data?.error || 'Error sending link');
        }
    });
}