// PUBLIC/JS/signup.js

const signupForm = document.getElementById('signupForm');

if(signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

       
        if(errorDiv) errorDiv.style.display = 'none';

        try {
            const response = await axios.post('/signup', { name, email, password });
            
            if (response.status === 201) {
                alert('Account created successfully! Please login.');
                window.location.href = '/login.html';
            }

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Signup failed';
            
            if (errorDiv) {
                errorDiv.innerText = msg;
                errorDiv.style.display = 'block';
            } else {
                alert(msg);
            }
        }
    });
}