const sql = require('mssql');

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
};