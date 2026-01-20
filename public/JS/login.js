// PUBLIC/JS/login.js
const loginBox = document.getElementById('login-box');
const forgotBox = document.getElementById('forgot-box');
const showForgotBtn = document.getElementById('show-forgot');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('loginForm');

if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        try {
           
            const res = await axios.post('/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            alert('Login Successful!');
            window.location.href = '/home.html'; 
            
        } catch (err) {
            console.error(err);
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.innerText = err.response?.data?.message || 'Login Failed'; // 'message' is standard in your errorMiddleware
            } else {
                alert(err.response?.data?.message || 'Login Failed');
            }
        }
    });
}

// Forgot Password Logic
const forgotForm = document.getElementById('forgotForm');
if(forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('forgot-email').value;
        try {
            const res = await axios.post('/password/forgotpassword', { email });
            alert(res.data.message);
            forgotBox.style.display = 'none';
            loginBox.style.display = 'block';
        } catch (err) {
            alert(err.response?.data?.error || 'Error sending link');
        }
    });
}