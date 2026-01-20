// PUBLIC/JS/home.js

// 1. AUTH CHECK (Run immediately)
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');

// If no user/token, force redirect to login
if (!token || !userStr) {
    window.location.href = '/login.html'; 
}

let user;
try {
    user = JSON.parse(userStr);
} catch (e) {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Global User ID
const currentUserId = user?._id || user?.id;

// Global Chart Instance
let myChart = null;

// Set default Axios Header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 2. DOM LOADED & EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    // Set Header Name
    const headerName = document.getElementById('headerUserName');
    if (headerName) headerName.innerText = user.name;

    // Load Initial Data
    loadSubscriptions();

    // --- NAVIGATION ROUTING (Tabs) ---
    setupNavigation();

    // --- LOGOUT BUTTON ---
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login.html';
        });
    }

    // --- SEARCH & ADD BUTTON ---
    const searchBtn = document.querySelector('.search-card .primary-btn');
    if(searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // --- MODAL BUTTONS ---
    document.querySelector('.btn-cancel')?.addEventListener('click', closeModal);
    document.querySelector('.btn-confirm')?.addEventListener('click', saveSubscription);
});

// 3. NAVIGATION LOGIC
function setupNavigation() {
    const navItems = [
        { id: 'nav-home', page: 'page-home' },
        { id: 'nav-bills', page: 'page-bills', action: loadBills }, // Load bills when clicked
        { id: 'nav-news', page: 'page-news', action: loadNews },    // Load news when clicked
        { id: 'nav-about', page: 'page-about' }
    ];

    navItems.forEach(item => {
        const link = document.getElementById(item.id);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Hide all pages
                document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
                
                // Show target page
                document.getElementById(item.page).style.display = 'block';

                // Run specific action if defined
                if (item.action) item.action();
            });
        }
    });
}

// 4. CORE FUNCTIONS
async function loadSubscriptions() {
    const fullListDiv = document.getElementById('full-list');
    if(!fullListDiv) return;
    
    fullListDiv.innerHTML = '<p>Loading...</p>';
    
    try {
        // ✅ Route Match: GET /subscriptions/:userId
        const res = await axios.get(`/subscriptions/${currentUserId}`); 
        const subs = res.data.filter(sub => sub.isActive !== false);

        fullListDiv.innerHTML = '';
        if (subs.length === 0) {
            fullListDiv.innerHTML = '<p>No active subscriptions.</p>';
            return;
        }

        subs.forEach(sub => {
            const item = document.createElement('div');
            item.className = 'sub-item';

            // --- STATUS BADGE LOGIC ---
            let statusBadge = '';
            const today = new Date();
            const renewalDate = new Date(sub.nextBillingDate);
            
            // Calculate days remaining
            const diffTime = renewalDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (sub.trialDays > 0 && diffDays > 0) {
                 statusBadge = `<span class="badge badge-trial">Trial: ${diffDays} days left</span>`;
            } else if (diffDays < 0) {
                 statusBadge = `<span class="badge badge-expired">Expired</span>`;
            } else {
                 statusBadge = `<span class="badge badge-active">Active</span>`;
            }

            item.innerHTML = `
                <div class="sub-left">
                    <h3>${sub.name}</h3>
                    <div class="sub-meta">Cost: <b>${sub.price} INR</b> | Renewal: ${renewalDate.toLocaleDateString()}</div>
                </div>
                <div class="sub-right">
                    ${statusBadge}
                    <button onclick="deleteSub('${sub._id}')" class="btn-delete">Remove</button>
                </div>
            `;
            fullListDiv.appendChild(item);
        });

    } catch (err) {
        console.error("Load Error:", err);
        if(err.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login.html';
        }
    }
}

// --- SEARCH & ADD LOGIC ---
async function handleSearch() {
    const query = document.getElementById('searchInput').value;
    const statusP = document.getElementById('status');
    if(!query) return;

    statusP.innerText = "🤖 AI is searching pricing...";
    
    try {
        // ✅ Route Match: POST /subscriptions/preview
        const res = await axios.post('/subscriptions/preview', { serviceName: query });
        const data = res.data.data;

        // Populate Modal
        document.getElementById('modalName').value = data.name;
        document.getElementById('modalPrice').value = data.price;
        document.getElementById('modalTrial').value = data.trialDays;
        document.getElementById('modalDate').valueAsDate = new Date(); // Default today

        // Show Modal
        document.getElementById('confirmModal').style.display = 'flex';
        statusP.innerText = "";
        
    } catch (err) {
        console.error(err);
        statusP.innerText = "Error fetching details.";
    }
}

async function saveSubscription() {
    const name = document.getElementById('modalName').value;
    const price = document.getElementById('modalPrice').value;
    const trial = document.getElementById('modalTrial').value;
    const date = document.getElementById('modalDate').value;

    try {
        // ✅ Route Match: POST /subscriptions/add
        await axios.post('/subscriptions/add', {
            userId: currentUserId,
            serviceName: name,
            price: price,
            trialDays: trial,
            startDate: date
        });

        closeModal();
        alert('Subscription Added!');
        loadSubscriptions(); // Refresh list
        document.getElementById('searchInput').value = '';
    } catch (err) {
        alert('Failed to add subscription');
    }
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// --- DELETE LOGIC ---
window.deleteSub = async function(id) {
    if(!confirm('Are you sure you want to remove this?')) return;
    try {
        await axios.delete(`/subscriptions/${id}`);
        loadSubscriptions();
        if(document.getElementById('page-bills').style.display === 'block') {
            loadBills(); // Refresh bills if on bills page
        }
    } catch(err) {
        alert('Error removing subscription');
    }
};

// --- BILLS PAGE LOGIC (UPDATED) ---
function loadBills() {
    axios.get(`/subscriptions/${currentUserId}`).then(res => {
        // Use active subs for calculation
        const activeSubs = res.data.filter(s => s.isActive !== false);
        
        // 1. Calculate Current Total
        const total = activeSubs.reduce((acc, sub) => acc + (sub.price || 0), 0);
        const totalEl = document.getElementById('totalCost');
        if(totalEl) totalEl.innerText = `${total} INR`;

        // 2. Render Paid List
        const paidList = document.getElementById('paid-list');
        if(paidList) {
            paidList.innerHTML = activeSubs.map(s => `
                <div class="sub-item">
                    <span>${s.name}</span>
                    <b>${s.price} INR</b>
                </div>
            `).join('');
        }

        // 3. Calculate Last 3 Months History
        const historyData = [];
        const labels = [];
        const today = new Date();

        // Loop: 2 months ago, 1 month ago, current month
        for (let i = 2; i >= 0; i--) {
            // Get Month Name (e.g., "Jan", "Feb")
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            labels.push(monthName);

            // Sum cost if subscription started before or during this month
            // (Assumes active subs have been active since startDate)
            const monthTotal = activeSubs.reduce((sum, sub) => {
                const start = new Date(sub.startDate);
                const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                
                if (start <= endOfMonth) {
                    return sum + (sub.price || 0);
                }
                return sum;
            }, 0);
            
            historyData.push(monthTotal);
        }

        // 4. Render Chart
        renderChart(labels, historyData);

        // 5. Render History Text List
        const historyListDiv = document.getElementById('history-list');
        if(historyListDiv) {
            historyListDiv.innerHTML = labels.map((label, idx) => `
                <div class="history-row">
                    <span>${label}</span>
                    <b>${historyData[idx]} INR</b>
                </div>
            `).join('');
        }
    });
}

// Helper: Render Chart.js
function renderChart(labels, data) {
    const ctx = document.getElementById('spendChart')?.getContext('2d');
    if (!ctx) return;

    if(myChart) {
        myChart.destroy(); // Destroy old instance to avoid overlap
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
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
                y: { 
                    beginAtZero: true, 
                    grid: { display: false } 
                },
                x: { 
                    grid: { display: false } 
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// --- NEWS PAGE LOGIC ---
async function loadNews() {
    const feed = document.getElementById('news-feed');
    if(!feed) return;
    
    feed.innerHTML = '<p>Fetching latest updates...</p>';
    try {
        // ✅ Route Match: GET /subscriptions/news
        const res = await axios.get('/subscriptions/news');
        feed.innerHTML = res.data; 
    } catch (err) {
        feed.innerHTML = '<p>News unavailable currently.</p>';
    }
}