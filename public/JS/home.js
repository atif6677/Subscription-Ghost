// Auth Check
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!token || !userStr) window.location.href = '/login.html';

const user = JSON.parse(userStr);
const currentUserId = user._id || user.id;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('headerUserName').innerText = user.name;
    loadSubscriptions();

    document.querySelector('.btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    const searchBtn = document.querySelector('.primary-btn');
    if(searchBtn) searchBtn.addEventListener('click', handleSearch);

    document.querySelector('.btn-cancel')?.addEventListener('click', closeModal);
    document.querySelector('.btn-confirm')?.addEventListener('click', saveSubscription);
});

async function loadSubscriptions() {
    const fullListDiv = document.getElementById('full-list');
    fullListDiv.innerHTML = '<p>Loading...</p>';
    
    try {
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

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const renewalDate = new Date(sub.nextBillingDate);
            renewalDate.setHours(0, 0, 0, 0);

            const diffTime = renewalDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            let statusBadge = '';
            if (sub.trialDays > 0 && diffDays > 0) {
                 statusBadge = `<span class="badge badge-trial">Trial: ${diffDays} days left</span>`;
            } else {
                 statusBadge = `<span class="badge badge-active">Active</span>`;
            }

           item.innerHTML = `
                <div class="sub-left">
                    <h3>${sub.name} <span class="sub-category">(${sub.category || 'Other'})</span></h3>
                    <div class="sub-meta">Cost: <b>${sub.price} INR</b> | Renewal: <span>${renewalDate.toLocaleDateString()}</span></div>
                </div>
                <div class="sub-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    ${statusBadge}
                    <div class="action-buttons">
                        ${sub.serviceLink ? `<a href="${sub.serviceLink}" target="_blank" class="btn-visit">Visit</a>` : ''}
                        <button onclick="deleteSub('${sub._id}')" class="btn-delete">Remove</button>
                    </div>
                </div>
            `;
            
            fullListDiv.appendChild(item);
        });
    } catch (err) {
        console.error(err);
    }
}

async function handleSearch() {
    const query = document.getElementById('searchInput').value;
    const statusP = document.getElementById('status');
    if(!query) return;

    statusP.innerText = "AI is searching pricing and links...";
    
    try {
        const res = await axios.post('/subscriptions/preview', { serviceName: query });
        const data = res.data.data;

        document.getElementById('modalName').value = data.name;
        document.getElementById('modalCategory').value = data.category || "Other";
        document.getElementById('modalPrice').value = data.price;
        document.getElementById('modalTrial').value = data.trialDays;
        document.getElementById('modalLink').value = data.serviceLink || ""; 
        document.getElementById('modalDate').valueAsDate = new Date(); 

        document.getElementById('confirmModal').style.display = 'flex';
        statusP.innerText = "";
        
    } catch (err) {
        statusP.innerText = "Error fetching details.";
    }
}

async function saveSubscription() {
    const name = document.getElementById('modalName').value;
    const category = document.getElementById('modalCategory').value;
    const price = document.getElementById('modalPrice').value;
    const trial = document.getElementById('modalTrial').value;
    const link = document.getElementById('modalLink').value;
    const date = document.getElementById('modalDate').value;

    try {
        await axios.post('/subscriptions/add', {
            userId: currentUserId,
            serviceName: name,
            category: category,
            price: price,
            trialDays: trial,
            serviceLink: link,
            startDate: date
        });

        closeModal();
        alert('Subscription Added!');
        loadSubscriptions();
        document.getElementById('searchInput').value = '';
    } catch (err) {
        alert('Failed to add subscription');
    }
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

window.deleteSub = async function(id) {
    if(!confirm('Are you sure?')) return;
    try {
        await axios.delete(`/subscriptions/${id}`);
        loadSubscriptions();
    } catch(err) {
        alert('Error removing');
    }
};