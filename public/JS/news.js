const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');
if (!token || !userStr) window.location.href = '/login.html';

const user = JSON.parse(userStr);
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('headerUserName').innerText = user.name;
    
    document.querySelector('.btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    loadNews();
});

async function loadNews() {
    const feed = document.getElementById('news-feed');
    try {
        const res = await axios.get('/subscriptions/news');
        feed.innerHTML = res.data; 
    } catch (err) {
        feed.innerHTML = '<p>News unavailable currently.</p>';
    }
}