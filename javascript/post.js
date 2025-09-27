import {
  getDatabase,
  ref,
  onValue
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 1. Kiểm tra đăng nhập
const userData = localStorage.getItem("currentUser");
if (!userData) {
  // Chưa đăng nhập → quay lại login
  window.location.href = "/static/login.html";
}
const currentUser = JSON.parse(userData);

// Hiện tên cạnh nút logout
document.getElementById("username").innerText = currentUser.name;

// 2. Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "/static/login.html";
});

// 3. Load danh sách bài viết
const postsRef = ref(database, "posts/" + currentUser.uid);
const postsList = document.getElementById("postsList");

onValue(postsRef, (snapshot) => {
  postsList.innerHTML = "";
  if (snapshot.exists()) {
    snapshot.forEach(child => {
      const post = child.val();

      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <div class="post-content">
          <div class="post-title">${post.title}</div>
          <div class="post-excerpt">${post.content}</div>
          <div class="post-meta">
            <span>${post.date || ""}</span>
            <span>${post.category || ""}</span>
          </div>
        </div>
      `;
      postsList.appendChild(card);
    });
  } else {
    postsList.innerHTML = `
      <div class="no-posts">
        <i class="fas fa-book-open" style="font-size: 3em; margin-bottom: 15px;"></i>
        <h3>Chưa có bài viết nào</h3>
        <p>Hãy tạo bài viết đầu tiên để bắt đầu hành trình nhật ký của bạn</p>
      </div>
    `;
  }
});

// 4. Chức năng tìm kiếm
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const cards = postsList.getElementsByClassName("post-card");

  Array.from(cards).forEach(card => {
    const title = card.querySelector(".post-title").innerText.toLowerCase();
    const content = card.querySelector(".post-excerpt").innerText.toLowerCase();

    if (title.includes(keyword) || content.includes(keyword)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});
