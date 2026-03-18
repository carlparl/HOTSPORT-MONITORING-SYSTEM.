document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
});

function connectWithVoucher() {
    const code = document.getElementById('voucher-code').value;
    if (code.length === 8) {
        alert(`Connecting with voucher ${code}... (demo)`);
        // In real app, call API to validate
    } else {
        alert('Please enter an 8‑character voucher code.');
    }
}

function buyPackage(duration, price) {
    alert(`You selected ${duration} package for UGX ${price}. (demo payment)`);
    // Simulate payment and voucher generation
    const voucher = 'UGX' + Math.random().toString(36).substring(2,10).toUpperCase();
    alert(`Your voucher code: ${voucher}\nUse it to connect.`);
    document.getElementById('voucher-code').value = voucher;
    document.querySelector('[data-tab="voucher"]').click();
}

function startTrial() {
    alert('30‑minute free trial started! You are now connected. (demo)');
}