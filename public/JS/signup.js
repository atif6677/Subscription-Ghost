// PUBLIC/JS/signup.js

const signupForm = document.getElementById('signupForm');

if(signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        // Clear previous errors
        if(errorDiv) errorDiv.style.display = 'none';

        try {
            // matches POST /signup in routes/signupRoute.js
            const response = await axios.post('/signup', { name, email, password });
            
            if (response.status === 201) {
                alert('Account created! Please login.');
                window.location.href = '/login.html';
            }

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Signup failed';
            
            if (errorDiv) {
                errorDiv.innerText = msg;
                errorDiv.style.display = 'block';
            } else {
                alert(msg);
            }
        }
    });
}