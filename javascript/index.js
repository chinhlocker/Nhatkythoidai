// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    query, 
    orderByChild, 
    get,
    remove 
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSnLwOyJjhQw2f89ZNaceZ1Mr-s3XqhHU",
    authDomain: "nhatkythoidai-565cb.firebaseapp.com",
    databaseURL: "https://nhatkythoidai-565cb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nhatkythoidai-565cb",
    storageBucket: "nhatkythoidai-565cb.firebasestorage.app",
    messagingSenderId: "561165880612",
    appId: "1:561165880612:web:d970e8c833e61d45e877b1",
    measurementId: "G-113LLR2L5J"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

// Kiểm tra trạng thái xác thực
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Chuyển hướng về trang đăng nhập nếu chưa xác thực
        window.location.href = '/static/login.html';
        return;
    }

    // Lấy và hiển thị tên người dùng từ database
    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById('username').textContent = userData.fullName;
            // Cập nhật lại localStorage
            localStorage.setItem('userName', userData.fullName);
        }
    }).catch((error) => {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
    });

    // Tải danh sách bài viết
    loadPosts(user.uid);
});

// Xử lý đăng xuất
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Xóa thông tin trong localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        // Chuyển hướng về trang đăng nhập
        window.location.href = '/static/login.html';
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
        alert('Đã có lỗi xảy ra khi đăng xuất');
    }
});

// Xử lý nút tạo bài viết mới
document.getElementById('newPostBtn').addEventListener('click', () => {
    window.location.href = '/static/post.html';
});

// Xử lý tìm kiếm và lọc
document.getElementById('searchInput').addEventListener('input', filterPosts);
document.getElementById('categoryFilter').addEventListener('change', filterPosts);
document.getElementById('sortFilter').addEventListener('change', filterPosts);

let allPosts = []; // Lưu trữ tất cả bài viết để tìm kiếm và lọc

// Hàm tải danh sách bài viết
function loadPosts(userId) {
    const postsRef = ref(database, `posts/${userId}`);
    onValue(postsRef, (snapshot) => {
        const postsData = snapshot.val();
        allPosts = [];
        
        if (postsData) {
            // Chuyển đổi object thành array và thêm id
            Object.keys(postsData).forEach(key => {
                allPosts.push({
                    id: key,
                    ...postsData[key]
                });
            });
        }
        
        filterPosts(); // Áp dụng bộ lọc hiện tại
    });
}

// Hàm lọc và hiển thị bài viết
function filterPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sortOrder = document.getElementById('sortFilter').value;
    
    let filteredPosts = [...allPosts];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
        );
    }
    
    // Lọc theo danh mục
    if (category !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    // Sắp xếp
    filteredPosts.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });
    
    displayPosts(filteredPosts);
}

// Hàm hiển thị bài viết
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsList');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-book-open" style="font-size: 3em; margin-bottom: 15px;"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy tạo bài viết đầu tiên để bắt đầu hành trình nhật ký của bạn</p>
            </div>`;
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-card ${post.isFavor ? 'favorite' : ''}">
            <div class="post-content">
                <div class="post-header">
                    <h3 class="post-title">${post.title || 'Không có tiêu đề'}</h3>
                    ${post.isFavor ? '<i class="fas fa-star favorite-icon"></i>' : ''}
                </div>
                <p class="post-excerpt">${JSON.parse(post.content).ops[0].insert.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <div class="post-meta">
                    <span><i class="fas fa-calendar"></i> ${new Date(post.createdTime).toLocaleString('vi-VN')}</span>
                    <span><i class="fas fa-folder"></i> ${getCategoryName(post.category)}</span>
                    ${post.emotion ? `<span class="post-emotion">${getEmotionEmoji(post.emotion)}</span>` : ''}
                </div>
                <div class="post-actions">
                    <button class="action-button edit-button" onclick="editPost('${post.id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="action-button delete-button" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Hàm lấy tên danh mục
function getCategoryName(category) {
    const categories = {
        'daily': 'Nhật ký hàng ngày',
        'memory': 'Kỷ niệm đáng nhớ',
        'love': 'Tình yêu'
    };
    
    if (category.startsWith('custom_')) {
        const customCategory = customCategories.find(c => c.id === category);
        return customCategory ? customCategory.name : category;
    }
    
    return categories[category] || category;
}

// Hàm lấy emoji cảm xúc
function getEmotionEmoji(emotionId) {
    const emotions = {
        'happy': '😊',
        'sad': '😢',
        'angry': '😡',
        'peaceful': '😌'
    };
    
    if (emotionId.startsWith('custom_')) {
        const customEmotion = customEmotions.find(e => e.id === emotionId);
        return customEmotion ? customEmotion.emoji : '😐';
    }
    
    return emotions[emotionId] || '😐';
}

// Hàm chỉnh sửa bài viết
function editPost(postId) {
    window.location.href = `/static/post.html?id=${postId}`;
}

// Hàm xóa bài viết
function deletePost(postId) {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        const userId = localStorage.getItem('userId');
        const postRef = ref(database, `posts/${userId}/${postId}`);
        remove(postRef)
            .then(() => {
                alert('Đã xóa bài viết thành công');
            })
            .catch(error => {
                console.error('Lỗi khi xóa bài viết:', error);
                alert('Đã có lỗi xảy ra khi xóa bài viết');
            });
    }
}

// Thêm các hàm vào window object để có thể gọi từ onclick
window.editPost = editPost;
window.deletePost = deletePost;