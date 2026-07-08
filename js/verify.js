import { auth } from "./firebase.js";

import {
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const alertBox = document.getElementById("alertBox");
const loadingBox = document.getElementById("loadingBox");

const checkBtn = document.getElementById("checkVerificationBtn");
const resendBtn = document.getElementById("resendVerificationBtn");
const logoutBtn = document.getElementById("logoutBtn");

function showAlert(message, type = "success") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}

const user = auth.currentUser;

if (!user) {

    showAlert("Please sign in first.", "warning");

}

/* -------------------------
   CHECK VERIFICATION
-------------------------- */

checkBtn?.addEventListener("click", async () => {

    if (!auth.currentUser) {

        showAlert("No signed-in user found.", "error");

        return;

    }

    loadingBox.style.display = "block";

    try {

        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {

            showAlert(
                "Email verified successfully. Redirecting...",
                "success"
            );

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1500);

        } else {

            showAlert(
                "Your email is not verified yet. Please click the verification link in your email.",
                "warning"
            );

        }

    } catch (err) {

        showAlert(err.message, "error");

    } finally {

        loadingBox.style.display = "none";

    }

});


/* -------------------------
   RESEND EMAIL
-------------------------- */

resendBtn?.addEventListener("click", async () => {

    if (!auth.currentUser) {

        showAlert("Please sign in again.", "error");

        return;

    }

    try {

        await sendEmailVerification(auth.currentUser);

        showAlert(
            "Verification email sent successfully.",
            "success"
        );

    } catch (err) {

        showAlert(err.message, "error");

    }

});


/* -------------------------
   LOG OUT
-------------------------- */

logoutBtn?.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (err) {

        showAlert(err.message, "error");

    }

});