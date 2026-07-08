// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firestore Database
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Storage
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDM6RnkCIOmNg8Vg66vsUT5HWTR_k0hR98",
    authDomain: "telsa-investment.firebaseapp.com",
    projectId: "telsa-investment",
    storageBucket: "telsa-investment.firebasestorage.app",
    messagingSenderId: "155873575422",
    appId: "1:155873575422:web:eb88d1d24dff84640640af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
