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
const path = require('path'); 
const db = require('./db'); // Đảm bảo file db.js đã dán link postgresql://...

const app = express();

// --- CẤU HÌNH MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type']
}));

// Phục vụ giao diện (Frontend)
app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dangnhap.html')); 
});

// --- 1. ROUTE ĐĂNG NHẬP (Sửa sang Async/Await) ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT username, role FROM users WHERE username = $1 AND password = $2';
    
    try {
        const row = await db.get(sql, [username, password]);
        if (row) {
            res.json({ status: "success", username: row.username, role: row.role });
        } else {
            res.json({ status: "fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (err) {
        console.error("Lỗi đăng nhập:", err.message);
        res.status(500).json({ status: "error", message: err.message });
    }
});
// --- 2. ROUTE ĐĂNG KÝ (Tất cả đăng ký mới đều là 'user') ---
app.post('/register', async (req, res) => {
    const { username, password, email, full_name } = req.body;
    const role = 'user'; 

    try {
        // 1. Kiểm tra xem username đã tồn tại chưa bằng hàm db.get đã viết trong db.js
        const userExists = await db.get('SELECT * FROM users WHERE username = $1', [username]);
        
        if (userExists) {
            // Nếu tìm thấy user, trả về status "exists" ngay lập tức
            return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
        }

        // 2. Nếu chưa tồn tại, thực hiện chèn dữ liệu mới
        const sql = `INSERT INTO users (username, password, email, full_name, role) VALUES ($1, $2, $3, $4, $5)`;
        await db.run(sql, [username, password, email, full_name, role]);

        // 3. Trả về thành công
        res.json({ status: "success" });

    } catch (err) {
        // Bắt lỗi dự phòng nếu có lỗi trùng lặp từ Database (mã 23505 của Postgres)
        if (err.code === '23505' || (err.message && err.message.toLowerCase().includes('unique'))) {
            return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
        }

        console.error("❌ Lỗi đăng ký chi tiết:", err);
        res.status(500).json({ status: "error", message: "Lỗi hệ thống khi đăng ký" });
    }
});

// --- 3. ROUTE THÊM SẢN PHẨM (Đã hỗ trợ ảnh nặng) ---
app.post('/add-product', async (req, res) => {
    const { name, price, image } = req.body;
    const sql = 'INSERT INTO products (name, price, image) VALUES ($1, $2, $3)';
    
    try {
        await db.run(sql, [name, price, image]);
        res.json({ status: "success" });
    } catch (err) {
        console.error("Lỗi thêm sản phẩm:", err.message);
        res.status(500).json({ status: "error" });
    }
});

// --- 4. ROUTE LẤY DANH SÁCH SẢN PHẨM ---
app.get('/products', async (req, res) => {
    const sql = 'SELECT id, name, price, image FROM products ORDER BY id DESC';
    try {
        const rows = await db.all(sql, []);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// --- 5. ROUTE XÓA SẢN PHẨM ---
app.delete('/delete-product/:id', async (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM products WHERE id = $1';
    try {
        await db.run(sql, [id]);
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// QUAN TRỌNG: Cấu hình cho Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Neon đang chạy trên cổng: ${PORT}`);
});