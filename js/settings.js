import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================================
HTML ELEMENTS
========================================== */

const menuBtn =
document.getElementById("menuBtn");

const sidebar =
document.getElementById("sidebar");

const logoutBtn =
document.getElementById("logoutBtn");

const profileImage =
document.getElementById("profileImage");

const profileName =
document.getElementById("profileName");

const profileEmail =
document.getElementById("profileEmail");

const fullName =
document.getElementById("fullName");

const phone =
document.getElementById("phone");

const country =
document.getElementById("country");

const accountForm =
document.getElementById("accountForm");

const passwordForm =
document.getElementById("passwordForm");

const newPassword =
document.getElementById("newPassword");

const confirmPassword =
document.getElementById("confirmPassword");

const emailNotifications =
document.getElementById("emailNotifications");

const depositNotifications =
document.getElementById("depositNotifications");

const withdrawNotifications =
document.getElementById("withdrawNotifications");

const investmentNotifications =
document.getElementById("investmentNotifications");

const notificationForm =
document.getElementById("notificationForm");

const theme =
document.getElementById("theme");

const currency =
document.getElementById("currency");

const language =
document.getElementById("language");

const saveAppearanceBtn =
document.getElementById("saveAppearanceBtn");

const emailVerified =
document.getElementById("emailVerified");

const memberSince =
document.getElementById("memberSince");

const lastLogin =
document.getElementById("lastLogin");

const alertBox =
document.getElementById("alertBox");
/* ==========================================
GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = {};
/* ==========================================
SHOW ALERT
========================================== */

function showAlert(message,type="success"){

    alertBox.innerHTML = `

    <div class="alert alert-${type}">

        ${message}

    </div>

    `;

    setTimeout(()=>{

        alertBox.innerHTML="";

    },4000);

}
/* ==========================================
FORMAT DATE
========================================== */

function formatDate(timestamp){

    if(!timestamp?.toDate){

        return "-";

    }

    return timestamp.toDate()

    .toLocaleDateString(

        undefined,

        {

            day:"numeric",

            month:"long",

            year:"numeric"

        }

    );

}
/* ==========================================
MOBILE MENU
========================================== */

menuBtn.addEventListener("click",()=>{

    sidebar.classList.toggle("active");

});
/* ==========================================
AUTHENTICATION
========================================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    try{

        const userRef = doc(

            db,

            "users",

            user.uid

        );

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            showAlert(

                "User account not found.",

                "error"

            );

            return;

        }

        currentUserData = userSnap.data();

        loadUserData();

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

});
/* ==========================================
LOAD USER DATA
========================================== */

function loadUserData(){

    profileName.textContent =

        currentUserData.fullName || "User";

    profileEmail.textContent =

        currentUserData.email || "";

    fullName.value =

        currentUserData.fullName || "";

    phone.value =

        currentUserData.phone || "";

    country.value =

        currentUserData.country || "";

    if(currentUserData.photoURL){

        profileImage.src =

            currentUserData.photoURL;

    }

}
/* ==========================================
ACCOUNT STATUS
========================================== */

emailVerified.textContent =

    currentUser.emailVerified

    ? "Verified"

    : "Not Verified";

memberSince.textContent =

    formatDate(

        currentUserData.createdAt

    );

if(currentUser.metadata.lastSignInTime){

    lastLogin.textContent =

    new Date(

        currentUser.metadata.lastSignInTime

    ).toLocaleString();

}
/* ==========================================
LOAD USER PREFERENCES
========================================== */

if(currentUserData.notifications){

    emailNotifications.checked =

        currentUserData.notifications.email ?? true;

    depositNotifications.checked =

        currentUserData.notifications.deposit ?? true;

    withdrawNotifications.checked =

        currentUserData.notifications.withdrawal ?? true;

    investmentNotifications.checked =

        currentUserData.notifications.investment ?? true;

}

theme.value =

    currentUserData.theme || "light";

currency.value =

    currentUserData.currency || "USD";

language.value =

    currentUserData.language || "en";
    /* ==========================================
SAVE ACCOUNT INFORMATION
========================================== */

accountForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    if(!currentUser) return;

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

        profileName.textContent =

            fullName.value.trim();

        showAlert(

            "Account information updated successfully."

        );

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

});
/* ==========================================
SAVE NOTIFICATION SETTINGS
========================================== */

notificationForm.addEventListener("submit",async(e)=>{

    e.preventDefault();

    if(!currentUser) return;

    try{

        await updateDoc(

            doc(db,"users",currentUser.uid),

            {

                notifications:{

                    email:emailNotifications.checked,

                    deposit:depositNotifications.checked,

                    withdrawal:withdrawNotifications.checked,

                    investment:investmentNotifications.checked

                },

                updatedAt:serverTimestamp()

            }

        );

        showAlert(

            "Notification settings saved."

        );

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

});
/* ==========================================
SAVE APPEARANCE SETTINGS
========================================== */

saveAppearanceBtn.addEventListener("click",async()=>{

    if(!currentUser) return;

    try{

        await updateDoc(

            doc(db,"users",currentUser.uid),

            {

                theme:theme.value,

                currency:currency.value,

                language:language.value,

                updatedAt:serverTimestamp()

            }

        );

        showAlert(

            "Appearance settings saved."

        );

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

});
/* ==========================================
CHANGE PASSWORD
========================================== */

passwordForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    if(!currentUser) return;

    const password =
        newPassword.value.trim();

    const confirm =
        confirmPassword.value.trim();

    if(password.length < 6){

        showAlert(

            "Password must be at least 6 characters.",

            "error"

        );

        return;

    }

    if(password !== confirm){

        showAlert(

            "Passwords do not match.",

            "error"

        );

        return;

    }

    try{

        await updatePassword(

            currentUser,

            password

        );

        showAlert(

            "Password updated successfully."

        );

        passwordForm.reset();

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

});
/* ==========================================
LOGOUT
========================================== */

logoutBtn.addEventListener("click", async(e)=>{

    e.preventDefault();

    try{

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch(error){

        console.error(error);

        showAlert(

            "Unable to logout.",

            "error"

        );

    }

});
/* ==========================================
CLOSE SIDEBAR ON MOBILE
========================================== */

document

.querySelectorAll(".sidebar a")

.forEach(link=>{

    link.addEventListener("click",()=>{

        if(window.innerWidth <= 900){

            sidebar.classList.remove("active");

        }

    });

});
/* ==========================================
PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log(

        "Settings Loaded Successfully."

    );

});
