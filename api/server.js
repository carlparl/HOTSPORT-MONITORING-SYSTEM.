const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotspot_pro', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Voucher schema
const voucherSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    price: Number,
    duration: String, // e.g., '4h', '24h', '7d'
    status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
    usedBy: String,
    createdAt: { type: Date, default: Date.now }
});
const Voucher = mongoose.model('Voucher', voucherSchema);

// Payment schema
const paymentSchema = new mongoose.Schema({
    amount: Number,
    phone: String,
    voucherCode: String,
    method: { type: String, enum: ['mobile money', 'cash', 'card'] },
    status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
    createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

// API Routes

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
    const totalRevenue = await Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const activeVouchers = await Voucher.countDocuments({ status: 'active' });
    const usedVouchers = await Voucher.countDocuments({ status: 'used' });
    res.json({
        revenue: totalRevenue[0]?.total || 0,
        activeVouchers,
        usedVouchers,
        activeUsers: Math.floor(Math.random() * 20) + 5 // simulate
    });
});

// Generate voucher
app.post('/api/vouchers', async (req, res) => {
    const { price, duration, count = 1 } = req.body;
    const vouchers = [];
    for (let i = 0; i < count; i++) {
        const code = generateVoucherCode();
        const voucher = new Voucher({ code, price, duration });
        await voucher.save();
        vouchers.push(voucher);
    }
    res.json({ success: true, vouchers });
});

// Validate voucher
app.post('/api/validate', async (req, res) => {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code, status: 'active' });
    if (voucher) {
        res.json({ valid: true, voucher });
    } else {
        res.json({ valid: false, message: 'Invalid or expired voucher' });
    }
});

// Record payment
app.post('/api/payments', async (req, res) => {
    const { amount, phone, method, voucherCode } = req.body;
    const payment = new Payment({ amount, phone, method, voucherCode });
    await payment.save();
    if (voucherCode) {
        await Voucher.findOneAndUpdate({ code: voucherCode }, { status: 'used', usedBy: phone });
    }
    res.json({ success: true, payment });
});

function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HotSpot Pro API running on port ${PORT}`);
});

// ==================== AUTHENTICATION ====================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User schema (simplified – you can expand)
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'admin' }
});
const User = mongoose.model('User', userSchema);

// Create default admin if not exists (for demo)
(async () => {
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
        const hashed = await bcrypt.hash('admin123', 10);
        await User.create({ username: 'admin', password: hashed });
        console.log('Default admin created (username: admin, password: admin123)');
    }
})();

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Protect API routes (apply to existing routes)
// Example: app.get('/api/stats', authenticate, async (req, res) => { ... });
// We'll modify existing routes later.