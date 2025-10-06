// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    get,
    update 
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

// Biến toàn cục
let startTime = Date.now();
let wordCount = 0;
let quill;
let postId = null;
let selectedCategory = 'daily';
let selectedEmotion = null;
let customCategories = [];
let customEmotions = [];

// Kiểm tra xác thực
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '/static/login.html';
        return;
    }

    // Khởi tạo Quill editor
    initQuillEditor();
    
    // Kiểm tra xem có đang chỉnh sửa bài viết cũ không
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');
    
    if (postId) {
        loadPost(postId, user.uid);
    }
    
    // Tải danh mục và cảm xúc tùy chỉnh
    loadCustomCategories(user.uid);
    loadCustomEmotions(user.uid);
});

// Xử lý sự kiện cho các danh mục
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedCategory = item.dataset.category;
    });
});

// Xử lý sự kiện cho các cảm xúc
document.querySelectorAll('.emotion-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.emotion-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedEmotion = item.dataset.emotion;
    });
});

// Thêm danh mục mới
document.getElementById('addCategoryBtn').addEventListener('click', async () => {
    const categoryName = prompt('Nhập tên danh mục mới:');
    if (!categoryName) return;

    const user = auth.currentUser;
    if (!user) return;

    const categoryId = 'custom_' + Date.now();
    const newCategory = {
        id: categoryId,
        name: categoryName,
        icon: 'fa-folder' // Icon mặc định
    };

    try {
        await set(ref(database, `users/${user.uid}/categories/${categoryId}`), newCategory);
        addCategoryToUI(newCategory);
        customCategories.push(newCategory);
    } catch (error) {
        console.error('Lỗi khi thêm danh mục:', error);
        alert('Không thể thêm danh mục mới');
    }
});

// Thêm cảm xúc mới
document.getElementById('addEmotionBtn').addEventListener('click', async () => {
    const emotionName = prompt('Nhập tên cảm xúc mới:');
    if (!emotionName) return;

    const emotionEmoji = prompt('Nhập emoji cho cảm xúc (ví dụ: 😊):');
    if (!emotionEmoji) return;

    const user = auth.currentUser;
    if (!user) return;

    const emotionId = 'custom_' + Date.now();
    const newEmotion = {
        id: emotionId,
        name: emotionName,
        emoji: emotionEmoji
    };

    try {
        await set(ref(database, `users/${user.uid}/emotions/${emotionId}`), newEmotion);
        addEmotionToUI(newEmotion);
        customEmotions.push(newEmotion);
    } catch (error) {
        console.error('Lỗi khi thêm cảm xúc:', error);
        alert('Không thể thêm cảm xúc mới');
    }
});

// Tải danh mục tùy chỉnh
async function loadCustomCategories(userId) {
    try {
        const snapshot = await get(ref(database, `users/${userId}/categories`));
        if (snapshot.exists()) {
            const categories = snapshot.val();
            customCategories = Object.values(categories);
            customCategories.forEach(addCategoryToUI);
        }
    } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
    }
}

// Tải cảm xúc tùy chỉnh
async function loadCustomEmotions(userId) {
    try {
        const snapshot = await get(ref(database, `users/${userId}/emotions`));
        if (snapshot.exists()) {
            const emotions = snapshot.val();
            customEmotions = Object.values(emotions);
            customEmotions.forEach(addEmotionToUI);
        }
    } catch (error) {
        console.error('Lỗi khi tải cảm xúc:', error);
    }
}

// Thêm danh mục vào giao diện
function addCategoryToUI(category) {
    const categoriesList = document.getElementById('categoriesList');
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category-item';
    categoryElement.dataset.category = category.id;
    categoryElement.innerHTML = `<i class="fas ${category.icon}"></i> ${category.name}`;
    
    categoryElement.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
        categoryElement.classList.add('selected');
        selectedCategory = category.id;
    });

    categoriesList.appendChild(categoryElement);
}

// Thêm cảm xúc vào giao diện
function addEmotionToUI(emotion) {
    const emotionsList = document.getElementById('emotionsList');
    const emotionElement = document.createElement('div');
    emotionElement.className = 'emotion-item';
    emotionElement.dataset.emotion = emotion.id;
    emotionElement.innerHTML = `${emotion.emoji} ${emotion.name}`;
    
    emotionElement.addEventListener('click', () => {
        document.querySelectorAll('.emotion-item').forEach(i => i.classList.remove('selected'));
        emotionElement.classList.add('selected');
        selectedEmotion = emotion.id;
    });

    emotionsList.appendChild(emotionElement);
}

// Xử lý nút thoát
document.getElementById('exitBtn').addEventListener('click', () => {
    if (quill.getText().trim() !== '') {
        if (confirm('Bạn có muốn lưu bài viết trước khi thoát không?')) {
            document.getElementById('savePost').click();
        }
    }
    window.location.href = '/static/index.html';
});

// Khởi tạo Quill Editor
function initQuillEditor() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        },
        placeholder: 'Hôm nay của bạn thế nào?'
    });

    // Theo dõi thay đổi để cập nhật số từ
    quill.on('text-change', updateWordCount);
}

// Cập nhật số từ
function updateWordCount() {
    const text = quill.getText();
    wordCount = text.trim().split(/\s+/).length;
    if (text.trim() === '') wordCount = 0;
    
    document.getElementById('wordCount').textContent = `Số từ: ${wordCount}`;
    updateTimeSpent();
}

// Cập nhật thời gian viết
function updateTimeSpent() {
    const timeSpent = Math.floor((Date.now() - startTime) / 60000); // Chuyển đổi thành phút
    document.getElementById('timeSpent').textContent = `Thời gian: ${timeSpent} phút`;
}

// Tải bài viết cũ để chỉnh sửa
async function loadPost(postId, userId) {
    try {
        const postRef = ref(database, `posts/${userId}/${postId}`);
        const snapshot = await get(postRef);
        
        if (snapshot.exists()) {
            const post = snapshot.val();
            
            // Điền thông tin bài viết
            document.getElementById('postTitle').value = post.title || '';
            quill.setContents(JSON.parse(post.content));
            document.getElementById('postCategory').value = post.category || 'daily';
            document.getElementById('isFavorite').checked = post.isFavor || false;
            
            // Cập nhật thời gian chỉnh sửa
            document.getElementById('lastEdit').textContent = 
                `Chỉnh sửa lần cuối: ${new Date(post.createdTime).toLocaleString('vi-VN')}`;
        }
    } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        alert('Không thể tải bài viết. Vui lòng thử lại sau.');
    }
}

// Lưu bài viết
document.getElementById('savePost').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const title = document.getElementById('postTitle').value.trim();
    const content = JSON.stringify(quill.getContents());
    const category = document.getElementById('postCategory').value;
    const isFavor = document.getElementById('isFavorite').checked;

    if (!title) {
        alert('Vui lòng nhập tiêu đề cho bài viết');
        return;
    }

    if (quill.getText().trim().length < 10) {
        alert('Nội dung bài viết quá ngắn');
        return;
    }

    const postData = {
        title,
        content,
        category: selectedCategory,
        emotion: selectedEmotion,
        isFavor,
        createdTime: Date.now(),
        authorId: user.uid
    };

    try {
        if (postId) {
            // Cập nhật bài viết cũ
            const postRef = ref(database, `posts/${user.uid}/${postId}`);
            await update(postRef, postData);
        } else {
            // Tạo bài viết mới
            const postsRef = ref(database, `posts/${user.uid}`);
            const newPostRef = push(postsRef);
            await set(newPostRef, postData);
        }

        alert('Đã lưu bài viết thành công!');
        window.location.href = '/static/index.html';
    } catch (error) {
        console.error('Lỗi khi lưu bài viết:', error);
        alert('Đã có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
    }
});

// Cập nhật thời gian định kỳ
setInterval(updateTimeSpent, 60000); // Cập nhật mỗi phút