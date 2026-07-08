import { auth } from "./firebase.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("forgotPasswordForm");

const emailInput = document.getElementById("email");

const alertBox = document.getElementById("alertBox");

const resetBtn = document.getElementById("resetBtn");
const resetText = document.getElementById("resetText");
const loadingSpinner = document.getElementById("loadingSpinner");

function showAlert(message, type = "success") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {

            showAlert("Please enter your email address.", "warning");
            return;

        }

        resetBtn.disabled = true;
        resetText.style.display = "none";
        loadingSpinner.style.display = "inline-flex";

        try {

            await sendPasswordResetEmail(auth, email);

            showAlert(
                "If an account exists for this email address, a password reset link has been sent. Please check your inbox (and Spam or Promotions folders if necessary).",
                "success"
            );

            form.reset();

        } catch (error) {

            console.error(error);

            let message =
                "We couldn't process your request. Please try again.";

            switch (error.code) {

                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many requests. Please wait a while before trying again.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection.";
                    break;

                default:
                    message =
                        "If an account exists for this email address, a password reset link has been sent.";

            }

            showAlert(message, "warning");

        } finally {

            resetBtn.disabled = false;
            resetText.style.display = "";
            loadingSpinner.style.display = "none";

        }

    });

}

