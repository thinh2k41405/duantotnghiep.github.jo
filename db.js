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

// Kết nối trực tiếp tới Neon bằng link bạn cung cấp
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_5IdBOpKNbRm3@ep-silent-night-aowm1oe8-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Hàm khởi tạo bảng
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                full_name TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price DECIMAL NOT NULL,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Tạo admin mặc định
        await pool.query(`
            INSERT INTO users (username, password, email, full_name, role)
            VALUES ('admin', '12345', 'admin@example.com', 'Administrator', 'admin')
            ON CONFLICT (username) DO NOTHING
        `);

        console.log("✅ Kết nối Neon thành công và đã khởi tạo bảng!");
    } catch (err) {
        console.error("❌ Lỗi Database:", err.message);
    }
};

initDb();

module.exports = {
    query: (text, params) => pool.query(text, params),
    get: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows.length > 0 ? res.rows[0] : null;
    },
    all: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows;
    },
    run: (text, params) => pool.query(text, params)
};