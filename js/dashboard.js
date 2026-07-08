import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
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

const userName =
document.getElementById("userName");

const profileName =
document.getElementById("profileName");

const profileEmail =
document.getElementById("profileEmail");

const profileImage =
document.getElementById("profileImage");

const walletBalance =
document.getElementById("walletBalance");

const portfolioBalance =
document.getElementById("portfolioBalance");

const expectedProfit =
document.getElementById("expectedProfit");

const expectedReturn =
document.getElementById("expectedReturn");

const runningInvestments =
document.getElementById("runningInvestments");

const completedInvestments =
document.getElementById("completedInvestments");

const recentTransactions =
document.getElementById("recentTransactions");

const recentNotifications =
document.getElementById("recentNotifications");

const accountName =
document.getElementById("accountName");

const accountEmail =
document.getElementById("accountEmail");

const accountCountry =
document.getElementById("accountCountry");

const accountPhone =
document.getElementById("accountPhone");

const memberSince =
document.getElementById("memberSince");
/* ==========================================
GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = {};

let investments = [];

let notifications = [];

let transactions = [];
/* ==========================================
MONEY FORMAT
========================================== */

function money(value){

    return "$" +

    Number(value || 0)

    .toLocaleString(

        undefined,

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );

}
/* ==========================================
DATE FORMAT
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

            month:"short",

            year:"numeric"

        }

    );

}
/* ==========================================
TRANSACTION ICON
========================================== */

function getTransactionIcon(type){

    switch(type){

        case "Deposit":

            return "fa-arrow-down";

        case "Withdrawal":

            return "fa-arrow-up";

        case "Investment":

            return "fa-chart-line";

        default:

            return "fa-wallet";

    }

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

            alert("User account not found.");

            return;

        }

        currentUserData = userSnap.data();

        loadProfile();

        await loadDashboard();

    }

    catch(error){

        console.error(error);

    }

});
/* ==========================================
LOAD PROFILE
========================================== */

function loadProfile(){

    userName.textContent =

        currentUserData.fullName || "User";

    profileName.textContent =

        currentUserData.fullName || "-";

    profileEmail.textContent =

        currentUserData.email || "-";

    accountName.textContent =

        currentUserData.fullName || "-";

    accountEmail.textContent =

        currentUserData.email || "-";

    accountCountry.textContent =

        currentUserData.country || "-";

    accountPhone.textContent =

        currentUserData.phone || "-";

    walletBalance.textContent =

        money(currentUserData.balance || 0);

    portfolioBalance.textContent =

        money(currentUserData.portfolio || 0);

    memberSince.textContent =

        formatDate(

            currentUserData.createdAt

        );

    if(currentUserData.photoURL){

        profileImage.src =

            currentUserData.photoURL;

    }

}
/* ==========================================
LOAD DASHBOARD
========================================== */

async function loadDashboard(){

    await Promise.all([

        loadInvestmentSummary(),

        loadRecentTransactions(),

        loadRecentNotifications()

    ]);

}
/* ==========================================
LOAD INVESTMENT SUMMARY
========================================== */

async function loadInvestmentSummary(){

    try{

        const q = query(

            collection(db,"investments"),

            where("userId","==",currentUser.uid),

            orderBy("createdAt","desc")

        );

        const snapshot = await getDocs(q);

        investments = [];

        let running = 0;

        let completed = 0;

        let profit = 0;

        let returns = 0;
                snapshot.forEach(doc=>{

            const data = doc.data();

            investments.push(data);

            profit += Number(

                data.expectedProfit || 0

            );

            returns += Number(

                data.expectedReturn || 0

            );

            if(data.status === "Running"){

                running++;

            }

            if(data.status === "Completed"){

                completed++;

            }

        });
                expectedProfit.textContent =

            money(profit);

        expectedReturn.textContent =

            money(returns);

        runningInvestments.textContent =

            running;

        completedInvestments.textContent =

            completed;

    }

    catch(error){

        console.error(

            "Investment Error:",

            error

        );

    }

}
/* ==========================================
REFRESH USER BALANCE
========================================== */

async function refreshUser(){

    try{

        const userSnap = await getDoc(

            doc(

                db,

                "users",

                currentUser.uid

            )

        );

        if(userSnap.exists()){

            currentUserData =

                userSnap.data();

            walletBalance.textContent =

                money(

                    currentUserData.balance

                );

            portfolioBalance.textContent =

                money(

                    currentUserData.portfolio

                );

        }

    }

    catch(error){

        console.error(error);

    }

}
/* ==========================================
AUTO REFRESH
========================================== */

setInterval(()=>{

    if(currentUser){

        refreshUser();

        loadInvestmentSummary();

    }

},30000);
/* ==========================================
LOAD RECENT TRANSACTIONS
========================================== */

async function loadRecentTransactions(){

    try{

        const q = query(

            collection(db,"transactions"),

            where("userId","==",currentUser.uid),

            orderBy("createdAt","desc"),

            limit(5)

        );

        const snapshot = await getDocs(q);

        recentTransactions.innerHTML = "";

        if(snapshot.empty){

            recentTransactions.innerHTML = `

            <div class="loading-card">

                <p>No recent transactions found.</p>

            </div>

            `;

            return;

        }
                snapshot.forEach(doc=>{

            const data = doc.data();

            recentTransactions.innerHTML += `

            <div class="transaction-item">

                <div class="transaction-left">

                    <div class="transaction-icon">

                        <i class="fa-solid ${getTransactionIcon(data.type)}"></i>

                    </div>

                    <div class="transaction-info">

                        <h4>${data.type}</h4>

                        <p>${data.description || ""}</p>

                    </div>

                </div>

                <div class="transaction-right">

                    <strong>${money(data.amount)}</strong>

                    <span>${data.status}</span>

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(

            "Transactions Error:",

            error

        );

    }

}
/* ==========================================
LOAD RECENT NOTIFICATIONS
========================================== */

async function loadRecentNotifications(){

    try{

        const q = query(

            collection(db,"notifications"),

            where("userId","==",currentUser.uid),

            orderBy("createdAt","desc"),

            limit(5)

        );

        const snapshot = await getDocs(q);

        recentNotifications.innerHTML = "";

        if(snapshot.empty){

            recentNotifications.innerHTML = `

            <div class="loading-card">

                <p>No notifications found.</p>

            </div>

            `;

            return;

        }
                snapshot.forEach(doc=>{

            const data = doc.data();

            recentNotifications.innerHTML += `

            <div class="notification-item">

                <div class="notification-icon">

                    <i class="fa-solid fa-bell"></i>

                </div>

                <div class="notification-content">

                    <h4>${data.title}</h4>

                    <p>${data.message}</p>

                    <small>${formatDate(data.createdAt)}</small>

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(

            "Notification Error:",

            error

        );

    }

}
/* ==========================================
REFRESH DASHBOARD
========================================== */

async function refreshDashboard(){

    if(!currentUser) return;

    try{

        const userSnap = await getDoc(

            doc(db,"users",currentUser.uid)

        );

        if(userSnap.exists()){

            currentUserData = userSnap.data();

            loadProfile();

        }

        await loadDashboard();

    }

    catch(error){

        console.error(

            "Dashboard Refresh Error:",

            error

        );

    }

}
/* ==========================================
LOGOUT
========================================== */

logoutBtn.addEventListener("click",async(e)=>{

    e.preventDefault();

    try{

        await signOut(auth);

        window.location.href="login.html";

    }

    catch(error){

        console.error(error);

        alert("Unable to logout.");

    }

});
/* ==========================================
CLOSE SIDEBAR ON MOBILE
========================================== */

document.querySelectorAll(".sidebar a")

.forEach(link=>{

    link.addEventListener("click",()=>{

        if(window.innerWidth <= 900){

            sidebar.classList.remove("active");

        }

    });

});
/* ==========================================
AUTO REFRESH
========================================== */

setInterval(()=>{

    refreshDashboard();

},30000);
/* ==========================================
PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log(

        "Dashboard Loaded Successfully."

    );

});
