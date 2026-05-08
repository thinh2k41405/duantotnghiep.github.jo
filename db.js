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
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo file database ngay trong thư mục code
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Lỗi kết nối:', err.message);
    else console.log('✅ Đã kết nối Database SQLite miễn phí!');
});

// Tự động tạo bảng (Nếu chưa có)
db.serialize(() => {
    // 1. TẠO BẢNG TRƯỚC
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. CHÈN ADMIN SAU (Ép buộc tạo tài khoản mặc định)
    db.run(`INSERT OR IGNORE INTO users (username, password, email, full_name, role) 
            VALUES ('admin', '12345', 'admin@example.com', 'Administrator', 'admin')`, (err) => {
        if (err) {
            console.error("Lỗi tạo admin mặc định:", err.message);
        } else {
            console.log("✅ Đã kiểm tra/tạo tài khoản admin mặc định.");
        }
    });
});

module.exports = db;