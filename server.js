const express = require('express');
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

app.listen(3000, () => console.log("🚀 Server chạy tại: http://localhost:3000"));