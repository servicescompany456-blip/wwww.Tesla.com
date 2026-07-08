import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

/* ==========================================
   HTML ELEMENTS
========================================== */

const withdrawForm = document.getElementById("withdrawForm");

const availableBalance = document.getElementById("availableBalance");

const netAmount = document.getElementById("netAmount");

const amount = document.getElementById("amount");

const paymentMethod = document.getElementById("paymentMethod");

const walletAddress = document.getElementById("walletAddress");

const walletCard = document.getElementById("walletCard");

const walletTitle = document.getElementById("walletTitle");

const walletNetwork = document.getElementById("walletNetwork");

const walletAddressDisplay = document.getElementById("walletAddressDisplay");

const copyAddress = document.getElementById("copyAddress");

const paymentProof = document.getElementById("paymentProof");

const proofPreview = document.getElementById("proofPreview");

const proofPreviewContainer = document.getElementById("proofPreviewContainer");

const paymentSent = document.getElementById("paymentSent");

const submitBtn = document.getElementById("submitBtn");

const submitText = document.getElementById("submitText");

const loadingSpinner = document.getElementById("loadingSpinner");

const alertBox = document.getElementById("alertBox");

const logoutBtn = document.getElementById("logoutBtn");

/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = null;

let proofImageURL = "";

const WITHDRAWAL_FEE = 1500;

/* ==========================================
   ALERT
========================================== */

function showAlert(message, type = "success") {

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

}

/* ==========================================
   GENERATE IDS
========================================== */

function generateTransactionId() {

    return "WTH-" + Date.now();

}

function generateReference() {

    return "REF-" + Math.random().toString(36).substring(2, 10).toUpperCase();

}

/* ==========================================
   WITHDRAWAL WALLETS
========================================== */

const wallets = {
    bitcoin: {
        title: "Bitcoin Wallet",
        network: "Bitcoin",
        address: "bc1qehc6asek4lwewyk6296u03nf69mdrve5xnruav"
    },

    usdt: {
        title: "USDT Wallet",
        network: "TRC20",
        address: "78shxuni7QuctVjRc4KfUFJ1Nq1rbw5rvjiVAwu1VyXsB"
    },

    ethereum: {
        title: "Ethereum Wallet",
        network: "ERC20",
        address: "0x82633933E8ea8ED49A8350320A26bBD3928C65d0"
    },

    Etransfer: {
        title: "Etransfer Wallet",
        network: "Etransfer",
        address: "daniellewatson8285@gmail.com"
    },

};
/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            showAlert("User account not found.", "error");

            return;

        }

        currentUserData = userSnap.data();

        const balance = Number(currentUserData.balance || 0);

        availableBalance.textContent =
            `$${balance.toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })}`;

        netAmount.textContent =
            `$${Math.max(balance - WITHDRAWAL_FEE,0).toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })}`;

    }

    catch(error){

        console.error(error);

        showAlert(error.message,"error");

    }

});
/* ==========================================
   CALCULATE NET AMOUNT
========================================== */

amount.addEventListener("input",()=>{

    if(!currentUserData) return;

    const balance = Number(currentUserData.balance || 0);

    const withdrawAmount = Number(amount.value || 0);

    if(withdrawAmount > balance){

        showAlert(

            "Insufficient available balance.",

            "error"

        );

        submitBtn.disabled = true;

        netAmount.textContent = "$0.00";

        return;

    }

    submitBtn.disabled = false;

    const net = Math.max(

        withdrawAmount - WITHDRAWAL_FEE,

        0

    );

    netAmount.textContent =
        `$${net.toLocaleString(undefined,{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        })}`;

});
/* ==========================================
   PAYMENT METHOD
========================================== */

paymentMethod.addEventListener("change",()=>{

    const method = paymentMethod.value;

    if(!method){

        walletCard.style.display = "none";

        return;

    }

    const wallet = wallets[method];

    walletCard.style.display = "block";

    walletTitle.textContent = wallet.title;

    walletNetwork.textContent = wallet.network;

    walletAddressDisplay.value = wallet.address;

});
/* ==========================================
   COPY WALLET ADDRESS
========================================== */

copyAddress.addEventListener("click",async()=>{

    if(!walletAddressDisplay.value) return;

    try{

        await navigator.clipboard.writeText(

            walletAddressDisplay.value

        );

        const original = copyAddress.innerHTML;

        copyAddress.innerHTML =
        '<i class="fa-solid fa-check"></i> Copied';

        setTimeout(()=>{

            copyAddress.innerHTML = original;

        },2000);

    }

    catch(error){

        console.error(error);

        showAlert(

            "Unable to copy wallet address.",

            "error"

        );

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
   SUBMIT WITHDRAWAL
========================================== */

withdrawForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) {

        showAlert("Please login again.", "error");

        return;

    }

    if (!currentUserData) {

        showAlert("Unable to load your account.", "error");

        return;

    }

    if (!paymentMethod.value) {

        showAlert("Please select a payment network.", "error");

        return;

    }

    if (!walletAddress.value.trim()) {

        showAlert("Enter your receiving wallet address.", "error");

        return;

    }

    if (!paymentSent.checked) {

        showAlert("Please confirm the withdrawal fee payment.", "error");

        return;

    }

    submitBtn.disabled = true;

    submitText.style.display = "none";

    loadingSpinner.style.display = "inline-flex";

    try {

        const transactionId = generateTransactionId();

        const reference = generateReference();

        const withdrawAmount = Number(amount.value);
                console.log("Saving withdrawal...");

        await addDoc(

            collection(db,"withdrawals"),

            {

                transactionId,

                reference,

                userId:currentUser.uid,

                fullName:currentUserData.fullName,

                email:currentUserData.email,

                amount:withdrawAmount,

                paymentMethod:paymentMethod.value,

                network:walletNetwork.textContent,

                walletAddress:walletAddress.value,

                proofImage:"",

                fee:WITHDRAWAL_FEE,

                status:"Pending",

                adminNote:"",

                createdAt:serverTimestamp()

            }

        );

        console.log("Withdrawal saved.");
                console.log("Saving transaction...");

        await addDoc(

            collection(db,"transactions"),

            {

                transactionId,

                reference,

                userId:currentUser.uid,

                fullName:currentUserData.fullName,

                email:currentUserData.email,

                type:"Withdrawal",

                amount:withdrawAmount,

                status:"Pending",

                description:"Withdrawal request submitted.",

                createdAt:serverTimestamp()

            }

        );

        console.log("Transaction saved.");
                console.log("Saving notification...");

        await addDoc(

            collection(db,"notifications"),

            {

                userId:currentUser.uid,

                title:"Withdrawal Submitted",

                message:`Your withdrawal request of $${withdrawAmount.toLocaleString()} has been submitted successfully and is awaiting approval.`,

                type:"withdrawal",

                read:false,

                createdAt:serverTimestamp()

            }

        );

        console.log("Notification saved.");
                showAlert(

            "Withdrawal request submitted successfully.",

            "success"

        );

        withdrawForm.reset();

        walletCard.style.display = "none";

        proofPreviewContainer.style.display = "none";

        proofPreview.src = "";

        walletAddressDisplay.value = "";

        netAmount.textContent = "$0.00";

    }

    catch(error){

        console.error(error);

        showAlert(error.message,"error");

    }

    finally{

        submitBtn.disabled = false;

        submitText.style.display = "";

        loadingSpinner.style.display = "none";

    }

});