import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================================
   HTML ELEMENTS
========================================== */

const registerForm = document.getElementById("registerForm");

const fullName = document.getElementById("fullName");

const email = document.getElementById("email");

const phone = document.getElementById("phone");

const country = document.getElementById("country");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const terms = document.getElementById("terms");

const alertBox = document.getElementById("alertBox");

const registerBtn = document.getElementById("registerBtn");

const registerText = document.getElementById("registerText");

const loadingSpinner = document.getElementById("loadingSpinner");


/* ==========================================
   ALERT
========================================== */

function showAlert(message, type = "error") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}


/* ==========================================
   BUTTON
========================================== */

function startLoading(){

    registerBtn.disabled = true;

    registerText.style.display = "none";

    loadingSpinner.style.display = "inline-flex";

}

function stopLoading(){

    registerBtn.disabled = false;

    registerText.style.display = "";

    loadingSpinner.style.display = "none";

}

/* ==========================================
   REGISTER
========================================== */

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        showAlert("", "success");

        /* ==========================
           VALIDATION
        ========================== */

        if (!fullName.value.trim()) {

            showAlert("Full name is required.");
            return;

        }

        if (!email.value.trim()) {

            showAlert("Email address is required.");
            return;

        }

        if (!phone.value.trim()) {

            showAlert("Phone number is required.");
            return;

        }

        if (!country.value.trim()) {

            showAlert("Country is required.");
            return;

        }

        if (password.value.length < 8) {

            showAlert("Password must be at least 8 characters.");

            return;

        }

        if (password.value !== confirmPassword.value) {

            showAlert("Passwords do not match.");

            return;

        }

        if (!terms.checked) {

            showAlert("Please accept the Terms & Conditions.");

            return;

        }

        startLoading();

        try {

            console.log("Creating Authentication Account...");

            const credential =
                await createUserWithEmailAndPassword(

                    auth,

                    email.value.trim(),

                    password.value

                );

            const user = credential.user;

            console.log("Authentication Created");

            /* ==========================
               UPDATE DISPLAY NAME
            ========================== */

            await updateProfile(user, {

                displayName: fullName.value.trim()

            });

            console.log("Display Name Updated");

            /* ==========================
               CREATE USER DOCUMENT
            ========================== */

            const userData = {

                uid: user.uid,

                fullName: fullName.value.trim(),

                email: email.value.trim().toLowerCase(),

                phone: phone.value.trim(),

                country: country.value.trim(),

                balance: 0,

                portfolio: 0,

                totalDeposits: 0,

                totalWithdrawals: 0,

                pendingRequests: 0,

                totalProfit: 0,

                totalInvestment: 0,

                profileImage: "",

                role: "user",

                accountStatus: "active",

                emailVerified: false,

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            };

            await setDoc(

                doc(db, "users", user.uid),

                userData

            );

            console.log("Firestore User Created");

            /* ==========================
               SEND VERIFICATION EMAIL
            ========================== */

            await sendEmailVerification(user);

            console.log("Verification Email Sent");

            showAlert(

                "Account created successfully. Redirecting...",

                "success"

            );

            setTimeout(() => {

                window.location.href = "verification.html";

            }, 1500);

        } catch (error) {

            console.error(error);

            let message = "Registration failed.";

            switch (error.code) {

    case "auth/email-already-in-use":

        message =
            "This email address is already registered.";

        break;

    case "auth/invalid-email":

        message =
            "Please enter a valid email address.";

        break;

    case "auth/weak-password":

        message =
            "Please choose a stronger password (minimum 8 characters).";

        break;

    case "auth/network-request-failed":

        message =
            "Unable to connect. Please check your internet connection and try again.";

        break;

    case "auth/too-many-requests":

        message =
            "Too many attempts. Please try again later.";

        break;

    case "auth/operation-not-allowed":

        message =
            "Account registration is currently unavailable.";

        break;

    case "permission-denied":
    case "firestore/permission-denied":

        message =
            "Unable to save your account information. Please try again later.";

        break;

    default:

        message =
            "Registration failed. Please try again.";

}

            showAlert(message);

        } finally {

            stopLoading();

        }

    });

}
