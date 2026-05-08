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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Khởi tạo cấu trúc dữ liệu
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

        // 2. Tạo bảng Products
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price DECIMAL NOT NULL,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Chèn Admin (Sử dụng tham số để tránh SQL Injection)
        const insertAdmin = `
            INSERT INTO users (username, password, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO NOTHING
        `;
        await pool.query(insertAdmin, ['admin', '12345', 'admin@example.com', 'Administrator', 'admin']);

        console.log("✅ Neon PostgreSQL: Khởi tạo bảng thành công!");
    } catch (err) {
        console.error("❌ Lỗi khởi tạo Database Neon:", err.message);
    }
};

initDb();

module.exports = {
    // Luôn dùng cái này để thực thi lệnh
    query: (text, params) => pool.query(text, params),
    
    // Hàm lấy 1 dòng - Dùng cho Register/Login check
    get: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows.length > 0 ? res.rows[0] : null; // Trả về null nếu ko có
    },

    // Hàm lấy danh sách
    all: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows;
    },

    run: (text, params) => pool.query(text, params)
};