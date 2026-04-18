// Lấy thông tin đăng nhập từ hệ thống
const role = sessionStorage.getItem('userRole');
const user = sessionStorage.getItem('username');

// --- 1. CHUYỂN ĐỔI GIAO DIỆN (SECTION) ---
function showSection(section) {
    // Lấy tất cả các "trang" nội dung
    const home = document.getElementById('home-content');
    const products = document.getElementById('product-content');
    const blog = document.getElementById('blog-content');
    const navLinks = document.querySelectorAll('.nav-links a');

    // 1. Ẩn tất cả mọi thứ trước
    if (home) home.style.display = 'none';
    if (products) products.style.display = 'none';
    if (blog) blog.style.display = 'none';

    // 2. Xóa class active của menu
    navLinks.forEach(link => link.classList.remove('active'));

    // 3. Hiển thị phần được chọn
    if (section === 'trangchu') {
        if (home) home.style.display = 'block';
        document.getElementById('nav-home').classList.add('active');
    } 
    else if (section === 'sanpham') {
        if (products) products.style.display = 'block';
        document.getElementById('nav-products').classList.add('active');
        if (typeof loadProducts === "function") loadProducts();
    } 
    else if (section === 'blog') {
        if (blog) blog.style.display = 'block';
        // Tìm đến nút Blog để add class active
        document.getElementById('nav-blog').classList.add('active');
    }
}

// --- 2. HIỂN THỊ CHÀO MỪNG & PHÂN QUYỀN ADMIN ---
function updateWelcomeMarquee() {
    const welcomeMsg = document.getElementById('welcome-msg');
    const authButtons = document.getElementById('auth-buttons');
    const adminSection = document.getElementById('admin-section');

    if (!welcomeMsg) return;

    if (user) {
        welcomeMsg.innerText = role === 'admin' 
            ? `⚡ [HỆ THỐNG] 🛡️ QUẢN TRỊ VIÊN: Chào mừng  ${user} bạn đã quay trở lại! ⚡` 
            : `✨ [VIP] 👋 Chào mừng ${user} đến với Store Limited! ✨`;
        
        // Hiện bảng thêm sản phẩm nếu là Admin
        if (adminSection) adminSection.style.display = role === 'admin' ? 'block' : 'none';
        
        welcomeMsg.classList.add('running');
        authButtons.innerHTML = `<button onclick="logout()" class="btn-auth btn-logout">Đăng xuất</button>`;
    } else {
        welcomeMsg.innerText = "🚀 STORE LIMITED: KHUYẾN MÃI CỰC KHỦNG - GIẢM GIÁ ĐẾN 50% CHO TẤT CẢ SẢN PHẨM! 🚀";
        welcomeMsg.classList.add('running');
        authButtons.innerHTML = `<button onclick="goToLogin()" class="btn-auth btn-login">Đăng nhập</button>`;
    }
}

// --- 3. QUẢN LÝ SẢN PHẨM (ADMIN & LOAD DỮ LIỆU) ---

async function addProduct() {
    // Chỉ Admin mới được thêm
    if (role !== 'admin') {
        alert("Bạn không có quyền thực hiện chức năng này!");
        return;
    }

    const nameEl = document.getElementById('prodName');
    const priceEl = document.getElementById('prodPrice');
    const imgInput = document.getElementById('prodImgFile');

    if (!nameEl.value || !priceEl.value || imgInput.files.length === 0) {
        alert("Vui lòng nhập đầy đủ thông tin và chọn ảnh!");
        return;
    }

    const file = imgInput.files[0];
    const reader = new FileReader();
    
    reader.onloadend = async () => {
        const newProduct = {
            name: nameEl.value,
            price: parseFloat(priceEl.value),
            image: reader.result 
        };

        try {
            const res = await fetch('http://localhost:3000/add-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if ((await res.json()).status === "success") {
                alert("Đã thêm sản phẩm thành công!");
                nameEl.value = ""; priceEl.value = ""; imgInput.value = ""; 
                loadProducts();
            }
        } catch (error) {
            alert("Lỗi kết nối Server!");
        }
    };
    reader.readAsDataURL(file);
}

async function deleteProduct(id) {
    if (role !== 'admin') {
        alert("Bạn không có quyền xóa sản phẩm!");
        return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) {
        try {
            const res = await fetch(`http://localhost:3000/delete-product/${id}`, { method: 'DELETE' });
            if ((await res.json()).status === "success") loadProducts();
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
        }
    }
}

function loadProducts() {
    fetch('http://localhost:3000/products')
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById('productList');
        if (!list) return;
        list.innerHTML = ""; 

        data.forEach(p => {
            let deleteBtn = role === 'admin' 
                ? `<button onclick="deleteProduct(${p.id})" class="btn-delete">Xóa sản phẩm</button>` 
                : "";
            list.innerHTML += `
                <div class="product-card">
                    <img src="${p.image}">
                    <h4>${p.name}</h4>
                    <p class="price">${Number(p.price).toLocaleString()} VNĐ</p>
                    <button class="btn-buy" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">
                        Thêm vào giỏ
                    </button>
                    ${deleteBtn}
                </div>`;
        });
    })
}

// --- 4. HỆ THỐNG GIỎ HÀNG (CHẶN NẾU CHƯA ĐĂNG NHẬP) ---

function addToCart(id, name, price, image) {
    // CHẶN: Phải đăng nhập mới được thêm vào giỏ
    if (!user) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "Dangnhap.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    alert(`Đã thêm ${name} vào giỏ hàng thành công!`);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-btn .badge');
    if (badge) badge.innerText = totalItems;
}

function openCart() {
    document.getElementById('cartModal').style.display = "block";
    renderCart();
}

function closeCart() {
    document.getElementById('cartModal').style.display = "none";
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const list = document.getElementById('cartItemsList');
    
    if (!list) return;
    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 40px; color: #888;'>Giỏ hàng trống rỗng!</p>";
        document.getElementById('totalPrice').innerText = "0";
        if (document.getElementById('selectedCount')) document.getElementById('selectedCount').innerText = "0";
        return;
    }

    cart.forEach((item, index) => {
        // Lưu ý: itemTotal ở đây chỉ hiện giá của 1 chiếc theo đúng ý đồ thanh toán của bạn
        const priceForOne = Number(item.price); 

        list.innerHTML += `
            <div class="cart-item" style="display: flex; align-items: center; padding: 12px 10px; border-bottom: 1px solid #2a2a2a;">
                <div style="width: 5%; text-align: center;">
                    <input type="checkbox" class="cart-checkbox" data-index="${index}" onchange="calculateSelectedTotal()" style="cursor: pointer;">
                </div>
                
                <div style="width: 40%; display: flex; align-items: center; gap: 12px;">
                    <img src="${item.image}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px;">
                    <span style="font-size: 0.95rem;">${item.name}</span>
                </div>
                
                <div style="width: 15%; text-align: center;">
                    ${priceForOne.toLocaleString()}₫
                </div>
                
                <div style="width: 15%; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <button onclick="changeQty(${index}, -1)" style="padding: 2px 8px; cursor: pointer; background: #333; color: white; border: 1px solid #444;">-</button>
                        <span style="min-width: 25px;">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" style="padding: 2px 8px; cursor: pointer; background: #333; color: white; border: 1px solid #444;">+</button>
                    </div>
                </div>
                
                <div style="width: 15%; text-align: center; color: #ff4d4d; font-weight: bold;">
                    ${priceForOne.toLocaleString()}₫
                </div>
                
                <div style="width: 10%; text-align: center;">
                    <button onclick="removeFromCart(${index})" style="color: #ff4d4d; background: none; border: none; cursor: pointer; font-size: 0.9rem;">Xóa</button>
                </div>
            </div>
        `;
    });
    
    calculateSelectedTotal();
}

// Giữ nguyên hàm changeQty và các hàm khác của bạn
function changeQty(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
}

function calculateSelectedTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkboxes = document.querySelectorAll('.cart-checkbox');
    let total = 0;
    let count = 0; // Đếm số loại sản phẩm được chọn

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const index = cb.getAttribute('data-index');
            // CHỈ CỘNG GIÁ CỦA 1 SẢN PHẨM
            total += Number(cart[index].price);
            count++;
        }
    });

    // Cập nhật hiển thị số tiền và số lượng sản phẩm chọn thanh toán
    document.getElementById('totalPrice').innerText = total.toLocaleString();
    const countElem = document.getElementById('selectedCount');
    if (countElem) countElem.innerText = count;

    // Tự động kiểm tra trạng thái nút "Chọn tất cả"
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    }
}

function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('.cart-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
    calculateSelectedTotal();
}
function checkoutSelected() {
    console.log("Nút thanh toán đã được nhấn"); // Kiểm tra xem hàm có chạy không

    // 1. KIỂM TRA ĐĂNG NHẬP
    // Chú ý: Biến 'user' phải được lấy từ sessionStorage hoặc localStorage nơi bạn lưu khi đăng nhập
    const currentUser = localStorage.getItem('user') || user; 
    
    if (!currentUser) {
        alert("Vui lòng đăng nhập để thực hiện thanh toán!");
        closeCart();
        window.location.href = "Dangnhap.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkboxes = document.querySelectorAll('.cart-checkbox');
    
    // Mảng để chứa tên các sản phẩm được chọn
    let selectedProductNames = [];
    let selectedIndices = [];

    checkboxes.forEach((cb, index) => {
        if (cb.checked) {
            selectedProductNames.push(cart[index].name);
            selectedIndices.push(index);
        }
    });

    // 2. KIỂM TRA XEM CÓ CHỌN SẢN PHẨM NÀO KHÔNG
    if (selectedProductNames.length === 0) {
        alert("Vui lòng tích chọn ít nhất một sản phẩm để thanh toán!");
        return;
    }

    // 3. XÁC NHẬN VÀ TRỪ SỐ LƯỢNG
    const productListText = selectedProductNames.join(", ");
    if (confirm(`Xác nhận thanh toán sản phẩm: ${productListText}?`)) {
        
        // Duyệt ngược để trừ số lượng
        for (let i = checkboxes.length - 1; i >= 0; i--) {
            if (checkboxes[i].checked) {
                cart[i].quantity -= 1; // Giảm 1 sản phẩm mỗi loại

                if (cart[i].quantity <= 0) {
                    cart.splice(i, 1);
                }
            }
        }

        // 4. LƯU VÀ CẬP NHẬT
        localStorage.setItem('cart', JSON.stringify(cart));
        alert("Thanh toán thành công!");
        
        renderCart(); 
        updateCartBadge();

        if (cart.length === 0) {
            closeCart();
        }
    }
}

function removeFromCart(index) {
    // CHẶN: Phải đăng nhập mới được xóa món khỏi giỏ
    if (!user) {
        alert("Vui lòng đăng nhập để quản lý giỏ hàng!");
        window.location.href = "Dangnhap.html";
        return;
    }

    if (confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); updateCartBadge();
    }
}

// --- 5. TÌM KIẾM ---
function searchProduct() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(input) ? "" : "none";
    });
}

// --- 6. HỆ THỐNG ---
function logout() {
    if(confirm("Bạn chắc chắn muốn đăng xuất?")) { 
        sessionStorage.clear(); 
        location.reload(); 
    }
}
function goToLogin() { window.location.href = "Dangnhap.html"; }

// --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener('DOMContentLoaded', () => {
    updateWelcomeMarquee();
    loadProducts();
    updateCartBadge();
});
//////////////////////////////////
function loadTop3Premium() {
    fetch('http://localhost:3000/products')
    .then(res => res.json())
    .then(data => {
        const topContainer = document.getElementById('topPriceProducts');
        if (!topContainer) return;

        // 1. Sắp xếp giá từ cao xuống thấp
        const sorted = data.sort((a, b) => Number(b.price) - Number(a.price));
        
        // 2. Lấy 3 thằng đầu tiên
        const top3 = sorted.slice(0, 3);

        topContainer.innerHTML = ""; // Xóa dữ liệu cũ

        top3.forEach(p => {
            topContainer.innerHTML += `
                <div class="top-item">
                    <img src="${p.image}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <span class="price-tag">${Number(p.price).toLocaleString()} VNĐ</span>
                    <button class="btn-buy" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">
                        SỞ HỮU NGAY
                    </button>
                </div>
            `;
        });
    });
}

// Gọi hàm này trong DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadTop3Premium(); // Chạy lấy Top 3
    // Các hàm khác của bạn...
});