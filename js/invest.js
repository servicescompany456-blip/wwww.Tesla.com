import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================================
   HTML ELEMENTS
========================================== */

const investForm = document.getElementById("investForm");

const planName = document.getElementById("planName");

const roi = document.getElementById("roi");

const duration = document.getElementById("duration");

const minimum = document.getElementById("minimum");

const maximum = document.getElementById("maximum");

const availableBalance = document.getElementById("availableBalance");

const investmentAmount = document.getElementById("investmentAmount");

const agreeInvestment = document.getElementById("agreeInvestment");

const summaryPlan = document.getElementById("summaryPlan");

const summaryAmount = document.getElementById("summaryAmount");

const summaryROI = document.getElementById("summaryROI");

const summaryDuration = document.getElementById("summaryDuration");

const expectedProfit = document.getElementById("expectedProfit");

const expectedReturn = document.getElementById("expectedReturn");

const submitBtn = document.getElementById("submitBtn");

const submitText = document.getElementById("submitText");

const loadingSpinner = document.getElementById("loadingSpinner");

const logoutBtn = document.getElementById("logoutBtn");

const alertBox = document.getElementById("alertBox");

let currentUser = null;

let currentUserData = null;

let selectedPlan = {};
/* ==========================================
   ALERT
========================================== */

function showAlert(message,type="success"){

    alertBox.innerHTML = `

    <div class="alert alert-${type}">

        ${message}

    </div>

    `;

}

/* ==========================================
   MONEY
========================================== */

function money(value){

    return "$"+Number(value||0).toLocaleString(

        undefined,

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );

}

/* ==========================================
   INVESTMENT ID
========================================== */

function generateInvestmentId(){

    return "INV-"+Date.now();

}

function generateReference(){

    return "REF-"+

    Math.random()

    .toString(36)

    .substring(2,10)

    .toUpperCase();

}

/* ==========================================
   LOAD PLAN FROM URL
========================================== */

const params = new URLSearchParams(window.location.search);

selectedPlan = {

    plan: params.get("plan") || "",

    min: Number(params.get("min") || 0),

    max: Number(params.get("max") || 0),

    roi: Number(params.get("roi") || 0),

    duration: Number(params.get("duration") || 0)

};

planName.value = selectedPlan.plan;

roi.value = selectedPlan.roi + "%";

duration.value = selectedPlan.duration + " Days";

minimum.value = money(selectedPlan.min);

maximum.value =

    selectedPlan.max >= 999999999

    ? "Unlimited"

    : money(selectedPlan.max);

summaryPlan.textContent = selectedPlan.plan;

summaryROI.textContent = selectedPlan.roi + "%";

summaryDuration.textContent =

    selectedPlan.duration + " Days";
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

        const userRef = doc(db,"users",user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            showAlert(

                "User account not found.",

                "error"

            );

            return;

        }

        currentUserData = userSnap.data();

        availableBalance.value =

            money(currentUserData.balance || 0);

    }

    catch(error){

        console.error(error);

        showAlert(error.message,"error");

    }

});
/* ==========================================
   LIVE CALCULATIONS
========================================== */

investmentAmount.addEventListener("input",()=>{

    const amount =

        Number(investmentAmount.value || 0);

    const profit =

        amount * (selectedPlan.roi / 100);

    const totalReturn =

        amount + profit;

    summaryAmount.textContent =

        money(amount);

    expectedProfit.textContent =

        money(profit);

    expectedReturn.textContent =

        money(totalReturn);

});
/* ==========================================
   VALIDATE INVESTMENT
========================================== */

function validateInvestment(){

    const amount =

        Number(investmentAmount.value);

    if(!agreeInvestment.checked){

        showAlert(

            "Please accept the investment agreement.",

            "error"

        );

        return false;

    }

    if(amount <= 0){

        showAlert(

            "Enter a valid investment amount.",

            "error"

        );

        return false;

    }

    if(amount < selectedPlan.min){

        showAlert(

            `Minimum investment is ${money(selectedPlan.min)}.`,

            "error"

        );

        return false;

    }

    if(

        selectedPlan.max !== 999999999 &&

        amount > selectedPlan.max

    ){

        showAlert(

            `Maximum investment is ${money(selectedPlan.max)}.`,

            "error"

        );

        return false;

    }

    if(

        amount >

        Number(currentUserData.balance || 0)

    ){

        showAlert(

            "Insufficient balance.",

            "error"

        );

        return false;

    }

    return true;

}
/* ==========================================
   START INVESTMENT
========================================== */

investForm.addEventListener("submit", async (e)=>{

    e.preventDefault();

    if(!validateInvestment()){

        return;

    }

    submitBtn.disabled = true;

    submitText.style.display = "none";

    loadingSpinner.style.display = "inline-flex";

    try{

        const amount =
            Number(investmentAmount.value);

        const profit =
            amount * (selectedPlan.roi / 100);

        const totalReturn =
            amount + profit;

        const investmentID =
            generateInvestmentId();

        const reference =
            generateReference();

        const endDate = new Date();

        endDate.setDate(

            endDate.getDate() +

            selectedPlan.duration

        );

        const currentBalance =
            Number(currentUserData.balance || 0);

        const currentPortfolio =
            Number(currentUserData.portfolio || 0);

        const userRef =
            doc(db,"users",currentUser.uid);
                    /* ==========================================
           UPDATE USER ACCOUNT
        ========================================== */

        await updateDoc(

            userRef,

            {

                balance:

                    currentBalance - amount,

                portfolio:

                    currentPortfolio + amount,

                updatedAt:

                    serverTimestamp()

            }

        );

        console.log("User updated.");
                /* ==========================================
           SAVE INVESTMENT
        ========================================== */

        await addDoc(

            collection(db,"investments"),

            {

                investmentId:

                    investmentID,

                reference:

                    reference,

                userId:

                    currentUser.uid,

                fullName:

                    currentUserData.fullName,

                email:

                    currentUserData.email,

                planName:

                    selectedPlan.plan,

                amount:

                    amount,

                roi:

                    selectedPlan.roi,

                expectedProfit:

                    profit,

                expectedReturn:

                    totalReturn,

                duration:

                    selectedPlan.duration,

                status:

                    "Running",

                completed:

                    false,

                startedAt:

                    serverTimestamp(),

                endDate:

                    Timestamp.fromDate(endDate),

                createdAt:

                    serverTimestamp()

            }

        );

        console.log("Investment saved.");
                /* ==========================================
           SAVE TRANSACTION
        ========================================== */

        await addDoc(

            collection(db,"transactions"),

            {

                transactionId:

                    investmentID,

                reference:

                    reference,

                userId:

                    currentUser.uid,

                fullName:

                    currentUserData.fullName,

                email:

                    currentUserData.email,

                type:

                    "Investment",

                amount:

                    amount,

                status:

                    "Running",

                description:

                    `${selectedPlan.plan} investment started.`,

                createdAt:

                    serverTimestamp()

            }

        );

        console.log("Transaction saved.");
                /* ==========================================
           SAVE NOTIFICATION
        ========================================== */

        await addDoc(

            collection(db,"notifications"),

            {

                userId:

                    currentUser.uid,

                title:

                    "Investment Started",

                message:

                    `Your ${selectedPlan.plan} investment of ${money(amount)} has started successfully.`,

                type:

                    "investment",

                read:

                    false,

                createdAt:

                    serverTimestamp()

            }

        );

        console.log("Notification saved.");
                /* ==========================================
           SUCCESS
        ========================================== */

        showAlert(

            "Investment started successfully.",

            "success"

        );

        investForm.reset();

        summaryAmount.textContent = money(0);

        expectedProfit.textContent = money(0);

        expectedReturn.textContent = money(0);

        availableBalance.value = money(

            currentBalance - amount

        );

        currentUserData.balance =

            currentBalance - amount;

        currentUserData.portfolio =

            currentPortfolio + amount;

        setTimeout(()=>{

            window.location.href="portfolio.html";

        },1500);

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

    finally{

        submitBtn.disabled = false;

        submitText.style.display = "";

        loadingSpinner.style.display = "none";

    }

});
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

        showAlert(

            "Unable to logout.",

            "error"

        );

    }

});
/* ==========================================
   PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log(

        "Investment Page Loaded Successfully."

    );

});
