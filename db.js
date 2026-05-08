/*onst sql = require('mssql');

const config = {
    user: 'sa',
    password: '1234', 
    server: '127.0.0.1', 
    database: 'login_system',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('✅ Kết nối Database thành công!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối SQL Server:', err.message);
        process.exit(1);
    });

// Xuất ra để file khác sử dụng
module.exports = {
    sql,
    poolPromise
};*/
const { Pool } = require('pg');

// Link kết nối Neon của bạn (Đã bao gồm mật khẩu npg_5IdBOpKNbRm3)
const connectionString = 'postgresql://neondb_owner:npg_5IdBOpKNbRm3@ep-silent-night-aowm1oe8.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Bắt buộc để kết nối an toàn với Neon
    }
});

// Khởi tạo cấu trúc dữ liệu (Tự động tạo bảng trên Neon)
const initDb = async () => {
    try {
        // 1. Tạo bảng Users
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                email TEXT,
                full_name TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Tạo bảng Products (Sản phẩm)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price DECIMAL NOT NULL,
                image TEXT, -- Lưu ảnh dưới dạng chuỗi Base64
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Chèn tài khoản Admin mặc định (admin / 12345)
        const insertAdmin = `
            INSERT INTO users (username, password, email, full_name, role)
            VALUES ('admin', '12345', 'admin@example.com', 'Administrator', 'admin')
            ON CONFLICT (username) DO NOTHING
        `;
        await pool.query(insertAdmin);

        console.log("✅ Neon PostgreSQL: Đã kết nối và khởi tạo bảng thành công!");
    } catch (err) {
        console.error("❌ Lỗi khởi tạo Database Neon:", err.message);
    }
};

// Gọi hàm khởi tạo
initDb();

// Export các hàm hỗ trợ để dùng trong server.js (Giữ tên cũ để ít phải sửa server.js nhất)
module.exports = {
    query: (text, params) => pool.query(text, params),
    // Hàm get (lấy 1 dòng)
    get: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows[0];
    },
    // Hàm all (lấy danh sách)
    all: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows;
    },
    // Hàm run (thực thi lệnh không trả về dữ liệu)
    run: (text, params) => pool.query(text, params)
};