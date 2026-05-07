
// 1. KHAI BÁO LINK SERVER (Thay link Render của bạn vào đây)
const API_URL = 'https://duantotnghiep-github-jo.onrender.com';

document.getElementById('btnRegister').addEventListener('click', function () {
    const user = document.getElementById('regUsername').value;
    const pass = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('regFullName').value;

    if(!user || !pass) {
        alert("Vui lòng nhập đủ tên và mật khẩu!");
        return;
    }

    const params = new URLSearchParams();
    params.append('username', user);
    params.append('password', pass);
    params.append('email', email);
    params.append('full_name', name);

    // 2. SỬA CHỖ NÀY: localhost -> API_BASE_URL
    fetch(`${API_BASE_URL}/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(res => res.json()) 
    .then(data => {
        if (data.status === "success") {
            alert("🎉 Đăng ký thành công! Giờ bạn có thể đăng nhập.");
            window.location.href = "Dangnhap.html"; 
        } else if (data.status === "exists") {
            alert("❌ Tên đăng nhập này đã có người dùng!");
        } else {
            alert("❌ " + (data.message || "Lỗi hệ thống, thử lại sau!"));
        }
    })
    .catch(err => {
        console.error("Lỗi kết nối:", err);
        // Sửa lại câu thông báo cho chuyên nghiệp hơn khi chạy thật
        alert("❌ Lỗi kết nối tới hệ thống. Vui lòng thử lại sau vài giây (Server đang khởi động)!");
    });
});
/*
document.getElementById('btnRegister').addEventListener('click', function ()
{
    const user = document.getElementById('regUsername').value;
    const pass = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('regFullName').value;

    if(!user || !pass) {
        alert("Vui lòng nhập đủ tên và mật khẩu!");
        return;
    }

    const params = new URLSearchParams();
    params.append('username', user);
    params.append('password', pass);
    params.append('email', email);
    params.append('full_name', name);

    fetch('http://localhost:3000/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(res => res.json()) 
    .then(data => {
        if (data.status === "success") {
            alert("🎉 Đăng ký thành công! Giờ bạn có thể đăng nhập.");
            window.location.href = "Dangnhap.html"; 
        } else if (data.status === "exists") {
            alert("❌ Tên đăng nhập này đã có người dùng!");
        } else {
            alert("❌ " + (data.message || "Lỗi hệ thống, thử lại sau!"));
        }
    })
    .catch(err => {
        console.error("Lỗi kết nối:", err);
        alert("❌ Không thể kết nối tới Server. Hãy kiểm tra xem Node.js đã chạy chưa!");
    });
});*/