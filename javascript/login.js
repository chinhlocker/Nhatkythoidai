// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import {
    getAuth,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = '/static/index.html';
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from database
        const userSnapshot = await get(ref(database, 'users/' + user.uid));
        const userData = userSnapshot.val();

        // Update last login
        await update(ref(database, 'users/' + user.uid), {
            lastLogin: new Date().toISOString()
        });

        // Save to localStorage
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userName', userData.fullName);

        // Redirect to index page
        window.location.href = '/static/index.html';

    } catch (error) {
        let errorMessage = 'Đã có lỗi xảy ra';
        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email không hợp lệ';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Không tìm thấy tài khoản';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mật khẩu không đúng';
        }
        alert(errorMessage);
    }
});

// Password visibility toggle
document.getElementById('passwordToggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});