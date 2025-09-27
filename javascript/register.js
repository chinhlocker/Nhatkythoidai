import {
  get,
  getDatabase,
  set,
  ref,
  onValue,
  update,
  remove,
  push,
  child,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);  
const database = getDatabase(app);

// Xử lý form tạo tài khoản
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newUser = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
    };

    // Kiểm tra mật khẩu
    if (newUser.password !== newUser.confirmPassword) {
        alert("Mật khẩu không trùng khớp");
        return;
    }

    // Thêm tài khoản vào Firebase
    const userRef = ref(database, 'user');
    push(userRef, newUser)
    .then(() => {
        alert('Tạo tài khoản thành công!');
        window.location.href = '/static/login.html';
    })
    .catch((error) => {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert("Đăng ký thất bại: " + error.message);
    });
});