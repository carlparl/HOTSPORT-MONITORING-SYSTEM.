document.addEventListener('DOMContentLoaded', function() {
    // Simulate real‑time updates
    setInterval(updateStats, 30000);
    setInterval(addRandomActivity, 45000);
    setupNotifications();
    setupSearch();
});

function updateStats() {
    // Randomly adjust stats to simulate live data
    const revenueEl = document.querySelector('.revenue .stat-info h3');
    const usersEl = document.querySelector('.users .stat-info h3');
    const vouchersEl = document.querySelector('.vouchers .stat-info h3');
    if (revenueEl) {
        let val = parseInt(revenueEl.textContent.replace(/[^0-9]/g,''));
        val += Math.floor(Math.random() * 1000) - 200;
        revenueEl.textContent = 'UGX ' + val.toLocaleString();
    }
    if (usersEl) {
        let val = parseInt(usersEl.textContent);
        val += Math.floor(Math.random() * 3) - 1;
        if (val < 0) val = 0;
        usersEl.textContent = val;
    }
    if (vouchersEl) {
        let val = parseInt(vouchersEl.textContent);
        val += Math.floor(Math.random() * 5) - 2;
        if (val < 0) val = 0;
        vouchersEl.textContent = val;
    }
}

function addRandomActivity() {
    const activities = [
        { type: 'success', icon: 'fa-money-check-alt', title: 'Payment Received', desc: 'UGX 5,000 • Weekly Package' },
        { type: 'info', icon: 'fa-user-plus', title: 'New User Connected', desc: 'Voucher: 0712ABC' },
        { type: 'warning', icon: 'fa-exclamation-triangle', title: 'Router Alert', desc: 'High memory usage' }
    ];
    const rand = activities[Math.floor(Math.random() * activities.length)];
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    const newItem = document.createElement('div');
    newItem.className = `activity-item ${rand.type}`;
    newItem.innerHTML = `
        <div class="activity-icon"><i class="fas ${rand.icon}"></i></div>
        <div class="activity-details">
            <h4>${rand.title}</h4>
            <p>${rand.desc}</p>
            <span>Just now</span>
        </div>
    `;
    activityList.insertBefore(newItem, activityList.firstChild);
    if (activityList.children.length > 3) activityList.removeChild(activityList.lastChild);
}

function setupNotifications() {
    document.querySelector('.btn-notification')?.addEventListener('click', function() {
        alert('You have 3 new notifications:\n• New payment received\n• Router rebooted\n• 5 new users connected');
        this.querySelector('.notification-count').style.display = 'none';
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (e.target.value.length > 2) {
                console.log('Searching for:', e.target.value);
                // In real app, call API
            }
        });
    }
}

function exportReports() {
    alert('Exporting reports... (demo)');
    // Simulate download
    const data = { revenue: 439052, users: 13, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function restartRouter() {
    if (confirm('Are you sure you want to restart the router?')) {
        alert('Router restart initiated. It will be back online in about 2 minutes.');
    }
}