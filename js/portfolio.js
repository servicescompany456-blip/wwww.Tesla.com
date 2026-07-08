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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================================
   HTML ELEMENTS
========================================== */

const portfolioBalance =
    document.getElementById("portfolioBalance");

const expectedProfitTotal =
    document.getElementById("expectedProfitTotal");

const expectedReturnTotal =
    document.getElementById("expectedReturnTotal");

const activeInvestments =
    document.getElementById("activeInvestments");

const portfolioList =
    document.getElementById("portfolioList");

const logoutBtn =
    document.getElementById("logoutBtn");

const filterButtons =
    document.querySelectorAll(".filter-btn");
    /* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = null;

let investments = [];

let currentFilter = "all";
/* ==========================================
   MONEY FORMAT
========================================== */

function money(value){

    return "$" +

    Number(value || 0).toLocaleString(

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

    if(!timestamp?.toDate) return "-";

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
   DAYS REMAINING
========================================== */

function daysRemaining(endDate){

    if(!endDate?.toDate) return 0;

    const end = endDate.toDate();

    const today = new Date();

    const diff =

        end.getTime() -

        today.getTime();

    return Math.max(

        Math.ceil(

            diff /

            (1000*60*60*24)

        ),

        0

    );

}
/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try{

        const userRef = doc(db,"users",user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            portfolioList.innerHTML = `

            <div class="empty-card">

                <i class="fa-solid fa-circle-xmark"></i>

                <h3>User Not Found</h3>

                <p>Your account could not be loaded.</p>

            </div>

            `;

            return;

        }

        currentUserData = userSnap.data();

        portfolioBalance.textContent =

            money(currentUserData.portfolio || 0);

        await loadInvestments();

    }

    catch(error){

        console.error(error);

    }

});
/* ==========================================
   LOAD INVESTMENTS
========================================== */

async function loadInvestments(){

    try{

        const q = query(

            collection(db,"investments"),

            where("userId","==",currentUser.uid),

            orderBy("createdAt","desc")

        );

        const snapshot = await getDocs(q);

        investments = [];

        let totalProfit = 0;

        let totalReturn = 0;

        let running = 0;
                snapshot.forEach(doc=>{

            const data = {

                id:doc.id,

                ...doc.data()

            };

            investments.push(data);

            totalProfit +=

                Number(data.expectedProfit || 0);

            totalReturn +=

                Number(data.expectedReturn || 0);

            if(data.status==="Running"){

                running++;

            }

        });
                expectedProfitTotal.textContent =

            money(totalProfit);

        expectedReturnTotal.textContent =

            money(totalReturn);

        activeInvestments.textContent =

            running;

        renderPortfolio();

    }

    catch(error){

        console.error(error);

    }

}
/* ==========================================
   RENDER PORTFOLIO
========================================== */

function renderPortfolio(){

    portfolioList.innerHTML = "";

    let filtered = investments.filter(item=>{

        if(currentFilter==="all"){

            return true;

        }

        return item.status===currentFilter;

    });

    if(filtered.length===0){

        portfolioList.innerHTML = `

        <div class="empty-card">

            <i class="fa-solid fa-chart-pie"></i>

            <h3>No Investments Found</h3>

            <p>

                You don't have any investments yet.

            </p>

        </div>

        `;

        return;

    }

    filtered.forEach(item=>{
                const remaining =

            daysRemaining(item.endDate);

        const totalDays =

            Number(item.duration || 1);

        const completedDays =

            Math.max(

                totalDays - remaining,

                0

            );

        const progress =

            Math.min(

                (completedDays / totalDays) * 100,

                100

            );
                    portfolioList.innerHTML += `

        <div class="investment-card">

            <div class="card-header">

                <h3>

                    ${item.planName}

                </h3>

                <span class="status ${item.status.toLowerCase()}">

                    ${item.status}

                </span>

            </div>

            <div class="card-details">

                <div class="detail">

                    <h5>Investment</h5>

                    <p>${money(item.amount)}</p>

                </div>

                <div class="detail">

                    <h5>ROI</h5>

                    <p>${item.roi}%</p>

                </div>

                <div class="detail">

                    <h5>Expected Profit</h5>

                    <p>${money(item.expectedProfit)}</p>

                </div>

                <div class="detail">

                    <h5>Expected Return</h5>

                    <p>${money(item.expectedReturn)}</p>

                </div>

                <div class="detail">

                    <h5>Started</h5>

                    <p>${formatDate(item.startedAt)}</p>

                </div>

                <div class="detail">

                    <h5>Ends</h5>

                    <p>${formatDate(item.endDate)}</p>

                </div>

                <div class="detail">

                    <h5>Remaining</h5>

                    <p>${remaining} Days</p>

                </div>

                <div class="detail">

                    <h5>Reference</h5>

                    <p>${item.reference}</p>

                </div>

            </div>
                        <div class="progress-section">

                <div class="progress-header">

                    <span>

                        Progress

                    </span>

                    <span>

                        ${progress.toFixed(0)}%

                    </span>

                </div>

                <div class="progress-bar">

                    <div

                        class="progress-fill"

                        style="width:${progress}%">

                    </div>

                </div>

            </div>

        </div>

        `;

    });

}
/* ==========================================
   FILTER BUTTONS
========================================== */

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterButtons.forEach(btn=>

            btn.classList.remove("active")

        );

        button.classList.add("active");

        currentFilter =

            button.dataset.filter;

        renderPortfolio();

    });

});
/* ==========================================
   REFRESH PORTFOLIO
========================================== */

async function refreshPortfolio(){

    if(!currentUser) return;

    try{

        const userSnap = await getDoc(

            doc(db,"users",currentUser.uid)

        );

        if(userSnap.exists()){

            currentUserData = userSnap.data();

            portfolioBalance.textContent =

                money(currentUserData.portfolio || 0);

        }

        await loadInvestments();

    }

    catch(error){

        console.error(error);

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
   AUTO REFRESH
========================================== */

setInterval(()=>{

    refreshPortfolio();

},30000);
/* ==========================================
   PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log(

        "Portfolio Loaded Successfully."

    );

});
