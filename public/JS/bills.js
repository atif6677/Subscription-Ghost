const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');
if (!token || !userStr) window.location.href = '/login.html';

const user = JSON.parse(userStr);
const currentUserId = user._id || user.id;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('headerUserName').innerText = user.name;
    
    document.querySelector('.btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    loadBills();
});

function loadBills() {
    axios.get(`/subscriptions/${currentUserId}`).then(res => {
        const allSubs = res.data.filter(s => s.isActive !== false);
        
        const payingSubs = allSubs.filter(sub => {
            const today = new Date();
            const renewalDate = new Date(sub.nextBillingDate);
            const diffTime = renewalDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const isTrialActive = (sub.trialDays > 0 && diffDays > 0);
            return !isTrialActive; 
        });

        const total = payingSubs.reduce((acc, sub) => acc + (sub.price || 0), 0);
        document.getElementById('totalCost').innerText = `${total} INR`;

        const paidList = document.getElementById('paid-list');
        
        if (payingSubs.length === 0) {
            paidList.innerHTML = '<p style="color:#666; font-size:14px;">No active paid subscriptions.</p>';
        } else {
            paidList.innerHTML = payingSubs.map(s => `
                <div class="sub-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="sub-left">
                        <span style="font-weight:600; font-size: 16px;">${s.name}</span>
                        <b style="color:#1a1a1a; margin-left: 10px;">${s.price} INR</b>
                    </div>
                    
                    ${s.serviceLink ? 
                        `<a href="${s.serviceLink}" target="_blank" class="btn-visit">
                            Visit Service
                        </a>` 
                        : ''
                    }
                </div>
            `).join('');
        }

        const categoryTotals = {};
        payingSubs.forEach(sub => {
            const cat = sub.category || 'Other';
            if (!categoryTotals[cat]) {
                categoryTotals[cat] = 0;
            }
            categoryTotals[cat] += (sub.price || 0);
        });

        const categoryListDiv = document.getElementById('category-list');
        if (total === 0) {
            categoryListDiv.innerHTML = '<p style="color:#666; font-size:13px;">No spending yet.</p>';
        } else {
            const categoryHtml = Object.keys(categoryTotals).map(cat => {
                const catTotal = categoryTotals[cat];
                const percentage = Math.round((catTotal / total) * 100);
                
                return `
                    <div class="history-row">
                        <span>${cat}</span>
                        <b>${percentage}% (${catTotal} INR)</b>
                    </div>
                `;
            }).join('');
            
            categoryListDiv.innerHTML = categoryHtml;
        }
        
        renderHistoryList(payingSubs);
    }).catch(err => {
        console.error("Error loading bills:", err);
    });
}

function renderHistoryList(payingSubs) {
    const historyListDiv = document.getElementById('history-list');
    const today = new Date();
    const historyHtml = [];

    for (let i = 2; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });

        const monthTotal = payingSubs.reduce((sum, sub) => {
            const start = new Date(sub.startDate);
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
    
    if (historyListDiv) historyListDiv.innerHTML = historyHtml.join('');
}