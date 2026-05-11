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
const db = require('./db'); 

const app = express();

// --- 1. CẤU HÌNH MIDDLEWARE ---
// Hỗ trợ upload ảnh Base64 dung lượng lớn
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình CORS để Frontend có thể gọi API từ bất cứ đâu
app.use(cors());

// Phục vụ các file tĩnh (HTML, CSS, JS, Image)
app.use(express.static(path.join(__dirname, '/')));

// --- 2. ĐIỀU HƯỚNG GIAO DIỆN ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dangnhap.html')); 
});

// --- 3. API ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Lưu ý: Trong thực tế nên dùng bcrypt để so sánh mật khẩu đã hash
    const sql = 'SELECT username, role FROM users WHERE username = $1 AND password = $2';
    
    try {
        const row = await db.get(sql, [username, password]);
        if (row) {
            console.log(`✅ Người dùng ${username} đăng nhập thành công.`);
            res.json({ status: "success", username: row.username, role: row.role });
        } else {
            res.json({ status: "fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (err) {
        console.error("❌ Lỗi đăng nhập:", err.message);
        res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ" });
    }
});

// --- 4. API ĐĂNG KÝ ---
app.post('/register', async (req, res) => {
    const { username, password, email, full_name } = req.body;
    const role = 'user'; 

    try {
        // Kiểm tra username tồn tại (Sử dụng hàm get đã tối ưu trả về null nếu ko thấy)
        const userExists = await db.get('SELECT username FROM users WHERE username = $1', [username]);
        
        if (userExists) {
            return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
        }

        // Chèn dữ liệu mới
        const sql = `INSERT INTO users (username, password, email, full_name, role) VALUES ($1, $2, $3, $4, $5)`;
        await db.run(sql, [username, password, email, full_name, role]);

        console.log(`👤 Đã tạo tài khoản mới: ${username}`);
        res.json({ status: "success" });

    } catch (err) {
        // Bắt lỗi trùng lặp từ PostgreSQL (mã 23505)
        if (err.code === '23505') {
            return res.json({ status: "exists", message: "Tài khoản đã tồn tại" });
        }
        console.error("❌ Lỗi đăng ký:", err);
        res.status(500).json({ status: "error", message: "Không thể hoàn tất đăng ký" });
    }
});

// --- 5. API SẢN PHẨM ---

// Lấy danh sách sản phẩm
app.get('/products', async (req, res) => {
    const sql = 'SELECT id, name, price, image FROM products ORDER BY id DESC';
    try {
        const rows = await db.all(sql, []);
        res.json(rows);
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách sản phẩm:", err.message);
        res.status(500).json({ status: "error" });
    }
});

// Thêm sản phẩm mới
app.post('/add-product', async (req, res) => {
    const { name, price, image } = req.body;
    const sql = 'INSERT INTO products (name, price, image) VALUES ($1, $2, $3)';
    
    try {
        await db.run(sql, [name, price, image]);
        res.json({ status: "success" });
    } catch (err) {
        console.error("❌ Lỗi thêm sản phẩm:", err.message);
        res.status(500).json({ status: "error" });
    }
});

// Xóa sản phẩm theo ID
app.delete('/delete-product/:id', async (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM products WHERE id = $1';
    try {
        await db.run(sql, [id]);
        res.json({ status: "success" });
    } catch (err) {
        console.error("❌ Lỗi xóa sản phẩm:", err.message);
        res.status(500).json({ status: "error" });
    }
});

// --- 6. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🌍 Môi trường triển khai: ${process.env.NODE_ENV || 'development'}`);
});