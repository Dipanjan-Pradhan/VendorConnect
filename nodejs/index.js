require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-very-secure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/Supplier/static', express.static(path.join(__dirname, '../src/Supplier/static')));
app.use('/Vendor/LandPage', express.static(path.join(__dirname, '../src/Vendor/LandPage')));
app.use('/Vendor/SupplierInfo', express.static(path.join(__dirname, '../src/Vendor/SupplierInfo')));
app.use(express.static(path.join(__dirname, '../'))); // For index.html, styles.css, etc.

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/Supplier/login');
    }
}

// --- ROUTES ---
// Public pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
// app.get('/Supplier/login', (req, res) => res.sendFile(path.join(__dirname, '../src/Supplier/login.html')));
app.get('/Supplier/welcome', (req, res) => res.sendFile(path.join(__dirname, '../src/Supplier/welcome.html')));
app.get('/Vendor/LandPage/vendor', (req, res) => res.sendFile(path.join(__dirname, '../src/Vendor/LandPage/vendor.html')));
// app.use('/Vendor/login/login', express.static(path.join(__dirname, '../src/Vendor/login/login')));
app.use('/Vendor/SupplierInfo/supplier', express.static(path.join(__dirname, '../src/Vendor/SupplierInfo/supplier.html')));
app.get('/Supplier/items', (req, res) => res.sendFile(path.join(__dirname, '../src/Supplier/items.html')));
app.get('/Supplier/profile', (req, res) => res.sendFile(path.join(__dirname, '../src/Supplier/profile.html')));

// Serve all HTML files in Vendor/LandPage
app.get('/Vendor/LandPage/:file', (req, res) => {
    res.sendFile(path.join(__dirname, '../Vendor/LandPage', req.params.file));
});
// Serve all HTML files in Vendor/SupplierInfo
app.get('/Vendor/SupplierInfo/:file', (req, res) => {
    res.sendFile(path.join(__dirname, '../Vendor/SupplierInfo', req.params.file));
});
// Serve all HTML files in Vendor/login
app.get('/Vendor/login/:file', (req, res) => {
    res.sendFile(path.join(__dirname, '../Vendor/login', req.params.file));
});

// Example: API endpoint for login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // TODO: Replace with real user lookup and password check
    if (email === 'supplier@example.com' && password === 'password123') {
        req.session.user = { email };
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Example: API endpoint for logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Example: API endpoint for registration (stub)
app.post('/api/register', (req, res) => {
    // TODO: Implement registration logic and user storage
    res.json({ success: true, message: 'Registration successful (stub)' });
});

// API routes
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/supplieritem', require('./routes/supplieritem'));
app.use('/api/user', require('./routes/user'));
app.use('/api/vender', require('./routes/vender'));

// Catch-all for 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
