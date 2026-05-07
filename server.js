/*const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- 1. ROUTE ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user', sql.NVarChar, username)
            .input('pass', sql.NVarChar, password)
            .query('SELECT username, role FROM users WHERE username = @user AND password = @pass');
        
        if (result.recordset.length > 0) {
            res.json({ 
                status: "success", 
                username: result.recordset[0].username,
                role: result.recordset[0].role 
            });
        } else {
            res.json({ status: "fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// --- 2. ROUTE ĐĂNG KÝ ---
app.post('/register', async (req, res) => {
    try {
        const { username, password, email, full_name } = req.body;
        const pool = await poolPromise;
        
        const check = await pool.request()
            .input('user', sql.NVarChar, username)
            .query('SELECT username FROM users WHERE username = @user');
        
        if (check.recordset.length > 0) {
            return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
        }

        await pool.request()
            .input('user', sql.NVarChar, username)
            .input('pass', sql.NVarChar, password)
            .input('mail', sql.NVarChar, email || '')
            .input('name', sql.NVarChar, full_name || '')
            .query(`INSERT INTO users (username, password, email, full_name, created_at, role) 
                    VALUES (@user, @pass, @mail, @name, GETDATE(), 'user')`);

        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// --- 3. ROUTE THÊM SẢN PHẨM ---
app.post('/add-product', async (req, res) => {
    try {
        const { name, price, image } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(18, 2), price)
            .input('image', sql.NVarChar(sql.MAX), image) 
            .query('INSERT INTO products (name, price, image, created_at) VALUES (@name, @price, @image, GETDATE())');
        
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// --- 4. ROUTE LẤY DANH SÁCH SẢN PHẨM ---
app.get('/products', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, name, price, image FROM products ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// --- 5. ROUTE XÓA SẢN PHẨM ---
app.delete('/delete-product/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, productId)
            .query('DELETE FROM products WHERE id = @id');

        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});
app.listen(3000, () => console.log("🚀 Server chạy tại: http://localhost:3000"));*/
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import file db.js đã sửa sang SQLite

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- 1. ROUTE ĐĂNG NHẬP ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT username, role FROM users WHERE username = ? AND password = ?';
    
    db.get(sql, [username, password], (err, row) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (row) {
            res.json({ status: "success", username: row.username, role: row.role });
        } else {
            res.json({ status: "fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

// --- 2. ROUTE ĐĂNG KÝ ---
app.post('/register', (req, res) => {
    const { username, password, email, full_name } = req.body;
    const sql = `INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, 'user')`;
    
    db.run(sql, [username, password, email, full_name], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
            }
            return res.status(500).json({ status: "error" });
        }
        res.json({ status: "success" });
    });
});

// --- 3. ROUTE THÊM SẢN PHẨM ---
app.post('/add-product', (req, res) => {
    const { name, price, image } = req.body;
    const sql = 'INSERT INTO products (name, price, image) VALUES (?, ?, ?)';
    
    db.run(sql, [name, price, image], function(err) {
        if (err) return res.status(500).json({ status: "error" });
        res.json({ status: "success" });
    });
});

// --- 4. ROUTE LẤY DANH SÁCH SẢN PHẨM ---
app.get('/products', (req, res) => {
    const sql = 'SELECT id, name, price, image FROM products ORDER BY id DESC';
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ status: "error" });
        res.json(rows);
    });
});

// --- 5. ROUTE XÓA SẢN PHẨM ---
app.delete('/delete-product/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM products WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ status: "error" });
        res.json({ status: "success" });
    });
});

// QUAN TRỌNG: Sửa để Render tự cấp Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server thật chạy tại cổng: ${PORT}`);
});