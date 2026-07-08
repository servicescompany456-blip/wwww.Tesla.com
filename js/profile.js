import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

/* ==========================
   ELEMENTS
========================== */

const profileForm = document.getElementById("profileForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const country = document.getElementById("country");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const joinedDate = document.getElementById("joinedDate");
const userId = document.getElementById("userId");

const verifyBadge = document.getElementById("verifyBadge");

const profileImage = document.getElementById("profileImage");
const profileUpload = document.getElementById("profileUpload");

const uploadProgress = document.getElementById("uploadProgress");
const progressFill = document.getElementById("progressFill");

const saveBtn = document.getElementById("saveBtn");
const saveText = document.getElementById("saveText");
const loadingSpinner = document.getElementById("loadingSpinner");

const alertBox = document.getElementById("alertBox");

const logoutBtn = document.getElementById("logoutBtn");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

let currentUser = null;
let profileImageURL = "";

/* ==========================
   ALERT
========================== */

function showAlert(message, type = "success") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}

/* ==========================
   LOAD USER
========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    try {

        const snap = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!snap.exists()) {

            showAlert("Profile not found.", "error");
            return;

        }

        const data = snap.data();

        fullName.value = data.fullName || "";
        email.value = data.email || "";
        phone.value = data.phone || "";
        country.value = data.country || "";

        profileName.textContent = data.fullName || "";
        profileEmail.textContent = data.email || "";

        userId.textContent = user.uid;

        verifyBadge.textContent =
            user.emailVerified
            ? "Verified"
            : "Not Verified";

        if (data.createdAt?.toDate) {

            joinedDate.textContent =
                data.createdAt
                .toDate()
                .toLocaleDateString();

        }

        if (data.profileImage) {

            profileImageURL = data.profileImage;

            profileImage.src = data.profileImage;

        }

    } catch (err) {

        console.error(err);

        showAlert(err.message, "error");

    }

});

/* ==========================
   PROFILE IMAGE UPLOAD
========================== */

profileUpload?.addEventListener("change", async (e) => {

    if (!currentUser) return;

    const file = e.target.files[0];

    if (!file) return;

    /* --------------------------
       FILE TYPE VALIDATION
    --------------------------- */

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        showAlert(
            "Only JPG, JPEG, PNG and WebP images are allowed.",
            "error"
        );

        profileUpload.value = "";

        return;

    }

    /* --------------------------
       FILE SIZE VALIDATION
    --------------------------- */

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {

        showAlert(
            "Image must not be larger than 2 MB.",
            "error"
        );

        profileUpload.value = "";

        return;

    }

    /* --------------------------
       LOCAL PREVIEW
    --------------------------- */

    const reader = new FileReader();

    reader.onload = (event) => {

        profileImage.src = event.target.result;

    };

    reader.readAsDataURL(file);

    /* --------------------------
       UPLOAD
    --------------------------- */

    try {

        uploadProgress.style.display = "block";

        progressFill.style.width = "0%";

        const storageRef = ref(
            storage,
            `profileImages/${currentUser.uid}/profile.${file.name.split(".").pop()}`
        );

        const uploadTask =
            uploadBytesResumable(storageRef, file);

        uploadTask.on(

            "state_changed",

            (snapshot) => {

                const percent = Math.round(
                    (snapshot.bytesTransferred /
                    snapshot.totalBytes) * 100
                );

                progressFill.style.width = percent + "%";

            },

            (error) => {

                console.error(error);

                showAlert(
                    "Image upload failed.",
                    "error"
                );

            },

            async () => {

                const downloadURL =
                    await getDownloadURL(
                        uploadTask.snapshot.ref
                    );

                profileImageURL = downloadURL;

                await updateDoc(
                    doc(db, "users", currentUser.uid),
                    {
                        profileImage: downloadURL,
                        updatedAt: serverTimestamp()
                    }
                );

                profileImage.src = downloadURL;

                progressFill.style.width = "100%";

                showAlert(
                    "Profile photo updated successfully.",
                    "success"
                );

                setTimeout(() => {

                    uploadProgress.style.display = "none";

                    progressFill.style.width = "0%";

                }, 1500);

            }

        );

    } catch (error) {

        console.error(error);

        showAlert(
            error.message,
            "error"
        );

    }

});

/* ==========================
   PASSWORD STRENGTH
========================== */

const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

newPassword?.addEventListener("input", () => {

    const password = newPassword.value;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch(score){

        case 0:
        case 1:

            strengthFill.style.width = "20%";
            strengthFill.style.background = "#dc2626";
            strengthText.textContent = "Weak";
            break;

        case 2:

            strengthFill.style.width = "40%";
            strengthFill.style.background = "#f97316";
            strengthText.textContent = "Fair";
            break;

        case 3:

            strengthFill.style.width = "60%";
            strengthFill.style.background = "#eab308";
            strengthText.textContent = "Good";
            break;

        case 4:

            strengthFill.style.width = "80%";
            strengthFill.style.background = "#22c55e";
            strengthText.textContent = "Strong";
            break;

        case 5:

            strengthFill.style.width = "100%";
            strengthFill.style.background = "#16a34a";
            strengthText.textContent = "Very Strong";
            break;

    }

});


/* ==========================
   SHOW / HIDE PASSWORD
========================== */

function setupToggle(buttonId, inputId){

    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);

    if(!button || !input) return;

    button.addEventListener("click",()=>{

        const icon = button.querySelector("i");

        if(input.type==="password"){

            input.type="text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        }else{

            input.type="password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

}

setupToggle("togglePassword","newPassword");
setupToggle("toggleConfirmPassword","confirmPassword");


/* ==========================
   SAVE PROFILE
========================== */

profileForm?.addEventListener("submit", async (e)=>{

    e.preventDefault();

    if(!currentUser) return;

    saveBtn.disabled = true;

    saveText.style.display = "none";

    loadingSpinner.style.display = "inline-flex";

    try{

        await updateDoc(
            doc(db,"users",currentUser.uid),
            {
                fullName:fullName.value.trim(),
                phone:phone.value.trim(),
                country:country.value.trim(),
                updatedAt:serverTimestamp()
            }
        );

        await updateProfile(currentUser,{
            displayName:fullName.value.trim()
        });

        profileName.textContent = fullName.value;

        if(
            newPassword.value.trim() !== "" ||
            confirmPassword.value.trim() !== ""
        ){

            if(newPassword.value !== confirmPassword.value){

                throw new Error("Passwords do not match.");

            }

            if(newPassword.value.length < 8){

                throw new Error(
                    "Password must contain at least 8 characters."
                );

            }

            await updatePassword(
                currentUser,
                newPassword.value
            );

        }

        newPassword.value = "";
        confirmPassword.value = "";

        strengthFill.style.width = "0%";
        strengthText.textContent = "Password Strength";

        showAlert(
            "Profile updated successfully.",
            "success"
        );

    }catch(error){

        console.error(error);

        let message = error.message;

        if(error.code === "auth/requires-recent-login"){

            message =
            "For security, please sign in again before changing your password.";

        }

        showAlert(message,"error");

    }finally{

        saveBtn.disabled = false;

        saveText.style.display = "";

        loadingSpinner.style.display = "none";

    }

});


/* ==========================
   LOGOUT
========================== */

logoutBtn?.addEventListener("click",async(e)=>{

    e.preventDefault();

    try{

        await signOut(auth);

        window.location.href="login.html";

    }catch(error){

        console.error(error);

        showAlert(
            "Unable to sign out.",
            "error"
        );

    }

});

