// public/JS/about.js

const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');

// If not logged in, redirect to login
if (!token || !userStr) {
    window.location.href = '/login.html';
} else {
    const user = JSON.parse(userStr);
    
    // Set Header Name
    const nameEl = document.getElementById('headerUserName');
    if(nameEl) nameEl.innerText = user.name;

    // Logout Logic
    const logoutBtn = document.querySelector('.btn-logout');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login.html';
        });
    }
}