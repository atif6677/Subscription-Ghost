// Auth Check
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');
if (!token || !userStr) window.location.href = '/login.html';

const user = JSON.parse(userStr);
const currentUserId = user._id || user.id;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('headerUserName').innerText = user.name;
    
    // Logout Logic
    document.querySelector('.btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    loadBills();
});

let myChart = null;

function loadBills() {
    axios.get(`/subscriptions/${currentUserId}`).then(res => {
        const activeSubs = res.data.filter(s => s.isActive !== false);
        
        // 1. Calculate Total
        const total = activeSubs.reduce((acc, sub) => acc + (sub.price || 0), 0);
        document.getElementById('totalCost').innerText = `${total} INR`;

        // 2. Render List
        const paidList = document.getElementById('paid-list');
        paidList.innerHTML = activeSubs.map(s => `
            <div class="sub-item">
                <span style="font-weight:600">${s.name}</span>
                <b style="color:#1a1a1a">${s.price} INR</b>
            </div>
        `).join('');

        // 3. Calculate History
        const historyData = [];
        const labels = [];
        const today = new Date();

        for (let i = 2; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(d.toLocaleString('default', { month: 'short' }));

            const monthTotal = activeSubs.reduce((sum, sub) => {
                const start = new Date(sub.startDate);
                return (start <= new Date(d.getFullYear(), d.getMonth() + 1, 0)) 
                    ? sum + (sub.price || 0) : sum;
            }, 0);
            historyData.push(monthTotal);
        }

        renderChart(labels, historyData);
        
        document.getElementById('history-list').innerHTML = labels.map((label, idx) => `
            <div class="history-row">
                <span>${label}</span>
                <b>${historyData[idx]} INR</b>
            </div>
        `).join('');
    });
}

function renderChart(labels, data) {
    const ctx = document.getElementById('spendChart')?.getContext('2d');
    if (!ctx) return;

    if(myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending',
                data: data,
                backgroundColor: '#1a1a1a',
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}