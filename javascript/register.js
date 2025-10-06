// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
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

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Reset error messages
    document.querySelectorAll('.error-message').forEach(elem => {
        elem.style.display = 'none';
        elem.textContent = '';
    });

    // Validate form
    let hasError = false;

    if (!fullName) {
        showError('fullNameError', 'Vui lòng nhập họ và tên');
        hasError = true;
    }

    if (!email) {
        showError('emailError', 'Vui lòng nhập email');
        hasError = true;
    }

    if (password.length < 6) {
        showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Mật khẩu không khớp');
        hasError = true;
    }

    if (hasError) return;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user data to Realtime Database
        await set(ref(database, 'users/' + user.uid), {
            fullName: fullName,
            email: email,
            lastLogin: new Date().toISOString()
        });

        // Save user info to localStorage
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userName', fullName);

        // Redirect to index page
        window.location.href = '/static/index.html';

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError('emailError', 'Email đã được sử dụng');
        } else {
            alert('Đã có lỗi xảy ra: ' + error.message);
        }
    }
});

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}