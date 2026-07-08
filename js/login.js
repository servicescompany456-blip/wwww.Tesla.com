import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const rememberMe = document.getElementById("rememberMe");

const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const loadingSpinner = document.getElementById("loadingSpinner");

const alertBox = document.getElementById("alertBox");

const togglePassword = document.getElementById("togglePassword");

function showAlert(message, type = "error") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const icon = togglePassword.querySelector("i");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            passwordInput.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

}

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        loginBtn.disabled = true;
        loginText.style.display = "none";
        loadingSpinner.style.display = "inline-flex";

        try {

            await setPersistence(
                auth,
                rememberMe.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    emailInput.value.trim(),
                    passwordInput.value
                );

            const user = credential.user;

            await user.reload();

            if (!user.emailVerified) {

                await signOut(auth);

                showAlert(
                    "Please verify your email address before signing in.",
                    "warning"
                );

                setTimeout(() => {

                    window.location.href = "verification.html";

                }, 1500);

                return;

            }

            showAlert(
                "Login successful. Redirecting...",
                "success"
            );

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1200);

        } catch (error) {

            console.error(error);

            let message = "Unable to sign in.";

            switch (error.code) {

    case "auth/invalid-credential":
        message = "Incorrect email or password.";
        break;

    case "auth/user-not-found":
        message = "No account exists with this email.";
        break;

    case "auth/wrong-password":
        message = "Incorrect email or password.";
        break;

    case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;

    case "auth/network-request-failed":
        message = "Unable to connect. Please check your internet connection and try again.";
        break;

    case "auth/too-many-requests":
        message = "Too many login attempts. Please try again later.";
        break;

    case "auth/user-disabled":
        message = "This account has been disabled. Please contact support.";
        break;

    default:
        message = "Login failed. Please try again.";
}

            showAlert(message);

        } finally {

            loginBtn.disabled = false;
            loginText.style.display = "";
            loadingSpinner.style.display = "none";

        }

    });

}
