/*window.onload = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const msgBox = document.getElementById('message-box');

    // --- 1. HÀM HIỂN THỊ THÔNG BÁO ---
    function showMsg(text, type) {
        if (!msgBox) return;
        msgBox.classList.remove('msg-error', 'msg-success', 'msg-warning');
        
        if (type === "red") msgBox.classList.add('msg-error');
        else if (type === "green") msgBox.classList.add('msg-success');
        else if (type === "orange") msgBox.classList.add('msg-warning');
        
        msgBox.innerText = text;
    }

    // --- 2. HÀM CHUYỂN ĐỔI FORM---
    function toggleForm(isLogin) {
        if (isLogin) {
            loginForm.style.display = 'block';    
            registerForm.style.display = 'none';    
        } else {
            loginForm.style.display = 'none';     
            registerForm.style.display = 'block';   
        }
        if(msgBox) msgBox.innerText = ""; 
    }

    // Gán sự kiện cho các link chuyển đổi
    document.getElementById('showRegister').onclick = (e) => { 
        e.preventDefault(); 
        toggleForm(false); 
    };

    document.getElementById('showLogin').onclick = (e) => { 
        e.preventDefault(); 
        toggleForm(true); 
    };

    // --- 3. XỬ LÝ ĐĂNG NHẬP ---
    document.getElementById('btnLogin').onclick = function () {
        const user = document.getElementById('txtUsername').value.trim();
        const pass = document.getElementById('txtPassword').value.trim();

        if (!user || !pass) {
            showMsg("⚠️ Vui lòng nhập đủ thông tin!", "orange");
            return;
        }

        const params = new URLSearchParams({ username: user, password: pass });

        fetch('http://localhost:3000/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const roleName = data.role === 'admin' ? "Quản trị viên" : "Khách hàng";
                showMsg(`🎉 Chào ${roleName} ${data.username}! Đang vào hệ thống...`, "green");
                
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('userRole', data.role);

                setTimeout(() => { window.location.href = "header.html"; }, 1200);
            } else {
                showMsg("❌ Tài khoản hoặc mật khẩu sai!", "red");
            }
        })
        .catch(() => showMsg("❌ Lỗi kết nối Server!", "red"));
    };

    // --- 4. XỬ LÝ ĐĂNG KÝ ---
    document.getElementById('btnRegister').onclick = function () {
        const user = document.getElementById('regUsername').value.trim();
        const pass = document.getElementById('regPassword').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const name = document.getElementById('regFullName').value.trim();

        if(!user || !pass || !email || !name) {
            showMsg("⚠️ Vui lòng điền đầy đủ thông tin!", "orange");
            return;
        }

        const params = new URLSearchParams({
            username: user, password: pass, email: email, full_name: name
        });

        fetch('http://localhost:3000/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        .then(res => res.json()) 
        .then(data => {
            if (data.status === "success") {
                showMsg("✅ Đăng ký thành công! Hãy đăng nhập.", "green");
                setTimeout(() => toggleForm(true), 2000);
            } else {
                showMsg("❌ " + (data.message || "Tài khoản đã tồn tại!"), "red");
            }
        })
        .catch(() => showMsg("❌ Lỗi kết nối Server!", "red"));
    };
// Tự động đóng menu khi nhấn vào một đường link bất kỳ trên mobile
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('navMenu').classList.remove('active');
            });
        });

    // Mặc định hiện form Login khi mới tải trang
    toggleForm(true);
};*/

window.onload = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const msgBox = document.getElementById('message-box');

    // QUAN TRỌNG: Thay link này bằng link Render của bạn
   const API_URL = 'https://duantotnghiep-github-jo.onrender.com';

    // --- 1. HÀM HIỂN THỊ THÔNG BÁO ---
    function showMsg(text, type) {
        if (!msgBox) return;
        msgBox.classList.remove('msg-error', 'msg-success', 'msg-warning');
        
        if (type === "red") msgBox.classList.add('msg-error');
        else if (type === "green") msgBox.classList.add('msg-success');
        else if (type === "orange") msgBox.classList.add('msg-warning');
        
        msgBox.innerText = text;
    }

    // --- 2. HÀM CHUYỂN ĐỔI FORM ---
    function toggleForm(isLogin) {
        if (isLogin) {
            if(loginForm) loginForm.style.display = 'block';    
            if(registerForm) registerForm.style.display = 'none';    
        } else {
            if(loginForm) loginForm.style.display = 'none';     
            if(registerForm) registerForm.style.display = 'block';   
        }
        if(msgBox) msgBox.innerText = ""; 
    }

    // Gán sự kiện cho các link chuyển đổi
    const showRegister = document.getElementById('showRegister');
    if(showRegister) {
        showRegister.onclick = (e) => { e.preventDefault(); toggleForm(false); };
    }

    const showLogin = document.getElementById('showLogin');
    if(showLogin) {
        showLogin.onclick = (e) => { e.preventDefault(); toggleForm(true); };
    }

    // --- 3. XỬ LÝ ĐĂNG NHẬP ---
    const btnLogin = document.getElementById('btnLogin');
    if(btnLogin) {
        btnLogin.onclick = function () {
            const user = document.getElementById('txtUsername').value.trim();
            const pass = document.getElementById('txtPassword').value.trim();

            if (!user || !pass) {
                showMsg("⚠️ Vui lòng nhập đủ thông tin!", "orange");
                return;
            }

            // Gửi dưới dạng JSON (Chuẩn hơn cho Node.js hiện đại)
            fetch(`${API_URL}/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    const roleName = data.role === 'admin' ? "Quản trị viên" : "Khách hàng";
                    showMsg(`🎉 Chào ${roleName} ${data.username}! Đang vào hệ thống...`, "green");
                    
                    // Lưu vào sessionStorage để dùng ở trang chủ
                    sessionStorage.setItem('username', data.username);
                    sessionStorage.setItem('userRole', data.role);

                    setTimeout(() => { window.location.href = "header.html"; }, 1200);
                } else {
                    showMsg("❌ " + (data.message || "Tài khoản hoặc mật khẩu sai!"), "red");
                }
            })
            .catch(() => showMsg("❌ Lỗi kết nối Server!", "red"));
        };
    }

    // --- 4. XỬ LÝ ĐĂNG KÝ ---
    const btnRegister = document.getElementById('btnRegister');
    if(btnRegister) {
        btnRegister.onclick = function () {
            const user = document.getElementById('regUsername').value.trim();
            const pass = document.getElementById('regPassword').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const name = document.getElementById('regFullName').value.trim();

            if(!user || !pass || !email || !name) {
                showMsg("⚠️ Vui lòng điền đầy đủ thông tin!", "orange");
                return;
            }

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
                if (data.status === "success") {
                    showMsg("✅ Đăng ký thành công! Hãy đăng nhập.", "green");
                    setTimeout(() => toggleForm(true), 2000);
                } else {
                    showMsg("❌ " + (data.message || "Tài khoản đã tồn tại!"), "red");
                }
            })
            .catch(() => showMsg("❌ Lỗi kết nối Server!", "red"));
        };
    }

    // Tự động đóng menu trên mobile
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            if(navMenu) navMenu.classList.remove('active');
        });
    });

    // Mặc định hiện form Login
    toggleForm(true);
};