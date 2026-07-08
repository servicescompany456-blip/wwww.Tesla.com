import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================================
   HTML ELEMENTS
========================================== */

const availableBalance =
    document.getElementById("availableBalance");

const logoutBtn =
    document.getElementById("logoutBtn");

const investButtons =
    document.querySelectorAll(".invest-btn");


let currentUser = null;


/* ==========================================
   MONEY FORMAT
========================================== */

function money(value){

    return "$" + Number(value || 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


/* ==========================================
   AUTH
========================================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try{

        const snap = await getDoc(
            doc(db,"users",user.uid)
        );

        if(!snap.exists()) return;

        const data = snap.data();

        availableBalance.textContent =
            money(data.balance);

    }catch(error){

        console.error(error);

    }

});
/* ==========================================
   INVEST BUTTONS
========================================== */

investButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const plan =
            button.dataset.plan;

        const min =
            button.dataset.min;

        const max =
            button.dataset.max;

        const roi =
            button.dataset.roi;

        const duration =
            button.dataset.duration;

        const url =

            `invest.html?plan=${encodeURIComponent(plan)}
            &min=${encodeURIComponent(min)}
            &max=${encodeURIComponent(max)}
            &roi=${encodeURIComponent(roi)}
            &duration=${encodeURIComponent(duration)}`
            .replace(/\s+/g,"");

        window.location.href = url;

    });

});
/* ==========================================
   REFRESH BALANCE
========================================== */

async function refreshBalance(){

    if(!currentUser) return;

    try{

        const snap = await getDoc(
            doc(db,"users",currentUser.uid)
        );

        if(!snap.exists()) return;

        const data = snap.data();

        availableBalance.textContent =
            money(data.balance);

    }catch(error){

        console.error(error);

    }

}


/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener("click", async(e)=>{

    e.preventDefault();

    try{

        await signOut(auth);

        window.location.href =
            "login.html";

    }catch(error){

        console.error(error);

        alert("Unable to logout.");

    }

});


/* ==========================================
   AUTO REFRESH
========================================== */

refreshBalance();


/* ==========================================
   PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log("Investment Plans Loaded Successfully.");

});
