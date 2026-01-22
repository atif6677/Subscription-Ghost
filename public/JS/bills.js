// public/JS/bills.js

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
        const allSubs = res.data.filter(s => s.isActive !== false);
        
        // 1. Filter: Only count services that are "Paying" (No active trial)
        const payingSubs = allSubs.filter(sub => {
            const today = new Date();
            const renewalDate = new Date(sub.nextBillingDate);
            const diffTime = renewalDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // If it has trial days AND the date hasn't passed, it's a Free Trial
            const isTrialActive = (sub.trialDays > 0 && diffDays > 0);
            
            // We only want Paying services (Trial ended OR No trial ever)
            return !isTrialActive; 
        });

        // 2. Calculate Total Monthly Bill
        const total = payingSubs.reduce((acc, sub) => acc + (sub.price || 0), 0);
        document.getElementById('totalCost').innerText = `${total} INR`;

        // 3. Render List (Only Paying Services)
        const paidList = document.getElementById('paid-list');
        if(payingSubs.length === 0) {
            paidList.innerHTML = '<p style="color:#666; font-size:14px;">No active paid subscriptions.</p>';
        } else {
            paidList.innerHTML = payingSubs.map(s => `
                <div class="sub-item">
                    <span style="font-weight:600">${s.name}</span>
                    <b style="color:#1a1a1a">${s.price} INR</b>
                </div>
            `).join('');
        }

        // 4. Prepare Chart Data (Breakdown by Service)
        const labels = payingSubs.map(s => s.name);
        const data = payingSubs.map(s => s.price);
        
        // Render the Circle (Doughnut) Map
        renderChart(labels, data);
        
        // 5. Render History Text (Right Side - Unchanged logic)
        renderHistoryList(payingSubs);
    });
}

function renderChart(labels, data) {
    const ctx = document.getElementById('spendChart')?.getContext('2d');
    if (!ctx) return;

    if(myChart) myChart.destroy();

    // If no data, show empty state or just don't render
    if(data.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut', // ✅ Circle Map
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#1a1a1a', // Black
                    '#404040', // Dark Gray
                    '#737373', // Medium Gray
                    '#a3a3a3', // Light Gray
                    '#d4d4d4', // Lighter
                    '#e5e5e5'  // Very Light
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', // Makes it a thinner ring
            plugins: {
                legend: { 
                    display: false // Hide labels on chart to keep it clean
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw} INR`;
                        }
                    }
                }
            }
        }
    });
}

// Helper for the Right Side History List
function renderHistoryList(payingSubs) {
    const historyListDiv = document.getElementById('history-list');
    const today = new Date();
    const historyHtml = [];

    // Simple history logic: Last 3 months totals
    for (let i = 2; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });

        // Calculate what the bill WAS for that month based on start dates
        const monthTotal = payingSubs.reduce((sum, sub) => {
            const start = new Date(sub.startDate);
            // If subscription existed in that month
            if (start <= new Date(d.getFullYear(), d.getMonth() + 1, 0)) {
                return sum + (sub.price || 0);
            }
            return sum;
        }, 0);

        historyHtml.push(`
            <div class="history-row">
                <span>${monthName}</span>
                <b>${monthTotal} INR</b>
            </div>
        `);
    }
    
    if(historyListDiv) historyListDiv.innerHTML = historyHtml.join('');
}