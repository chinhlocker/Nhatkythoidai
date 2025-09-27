import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSnLwOyJjhQw2f89ZNaceZ1Mr-s3XqhHU",
  authDomain: "nhatkythoidai-565cb.firebaseapp.com",
  projectId: "nhatkythoidai-565cb",
  storageBucket: "nhatkythoidai-565cb.firebasestorage.app",
  messagingSenderId: "561165880612",
  appId: "1:561165880612:web:d970e8c833e61d45e877b1",
  measurementId: "G-113LLR2L5J",
  databaseURL: "https://nhatkythoidai-565cb-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Xử lý form login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Lấy dữ liệu người nhập
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Trỏ tới node "user"
  const userRef = ref(db, "user");

  try {
    // Lấy dữ liệu từ Firebase
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      alert("Chưa có tài khoản nào trong hệ thống!");
      return;
    }

    let foundUser = null;

    // Duyệt qua từng user
    snapshot.forEach((child) => {
      const user = child.val();
      if (user.email === email) {
        foundUser = user;
      }
    });

    // Kiểm tra kết quả
    if (!foundUser) {
      alert("Email không tồn tại!");
    } else if (foundUser.password !== password) {
      alert("Sai mật khẩu!");
    } else {
      alert("Đăng nhập thành công!");

      // Lưu thông tin user vào localStorage để sử dụng sau này
      localStorage.setItem("currentUser", JSON.stringify(foundUser));

      // Chuyển hướng sang trang chính
      window.location.href = "/static/index.html";
    }
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    alert("Có lỗi xảy ra, vui lòng thử lại!");
  }
});