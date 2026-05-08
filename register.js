// 1. KHAI BÁO LINK SERVER (Đã thống nhất tên biến API_URL)
const API_URL = 'https://duantotnghiep-github-jo.onrender.com';

document.getElementById('btnRegister').addEventListener('click', function () {
    const user = document.getElementById('regUsername').value.trim();
    const pass = document.getElementById('regPassword').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const name = document.getElementById('regFullName').value.trim();

    if(!user || !pass || !email || !name) {
        alert("⚠️ Vui lòng nhập đầy đủ tất cả thông tin!");
        return;
    }

    // Vô hiệu hóa nút để tránh người dùng bấm nhiều lần gây lỗi dữ liệu
    const btnRegister = document.getElementById('btnRegister');
    btnRegister.disabled = true;
    btnRegister.innerText = "Đang xử lý...";

    // 2. SỬA LỖI: Dùng JSON để đồng bộ với server.js đã sửa
    fetch(`${API_URL}/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: user,
            password: pass,
            email: email,
            full_name: name
        })
    })
    .then(res => res.json()) 
    .then(data => {
        btnRegister.disabled = false;
        btnRegister.innerText = "ĐĂNG KÝ";

        if (data.status === "success") {
            alert("🎉 Đăng ký thành công! Giờ bạn có thể đăng nhập.");
            // Nếu bạn dùng hàm toggleForm từ script.js thì gọi nó, 
            // còn không thì chuyển trang như bên dưới:
            window.location.href = "Dangnhap.html"; 
        } else if (data.status === "exists") {
            alert("❌ Tên đăng nhập này đã có người dùng!");
        } else {
            alert("❌ " + (data.message || "Lỗi hệ thống, thử lại sau!"));
        }
    })
    .catch(err => {
        btnRegister.disabled = false;
        btnRegister.innerText = "ĐĂNG KÝ";
        console.error("Lỗi kết nối:", err);
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