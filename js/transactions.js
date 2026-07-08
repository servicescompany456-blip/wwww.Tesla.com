import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================================
   HTML ELEMENTS
========================================== */

const transactionList =
    document.getElementById("transactionList");

const emptyState =
    document.getElementById("emptyState");

const searchTransaction =
    document.getElementById("searchTransaction");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser = null;

let transactions = [];

let currentFilter = "all";

let unsubscribe = null;
/* ==========================================
   AUTH
========================================== */

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser=user;

    loadTransactions();

});
/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(timestamp){

    if(!timestamp) return "-";

    return timestamp.toDate().toLocaleDateString(

        "en-US",

        {

            day:"numeric",

            month:"long",

            year:"numeric"

        }

    );

}


/* ==========================================
   TIME FORMAT
========================================== */

function formatTime(timestamp){

    if(!timestamp) return "-";

    return timestamp.toDate().toLocaleTimeString(

        "en-US",

        {

            hour:"2-digit",

            minute:"2-digit",

            second:"2-digit"

        }

    );

}
/* ==========================================
   ICONS
========================================== */

function transactionIcon(type){

    switch(type){

        case "Deposit":

            return "fa-money-bill-transfer";

        case "Withdrawal":

            return "fa-wallet";

        case "Investment":

            return "fa-chart-line";

        case "Profit":

            return "fa-coins";

        default:

            return "fa-receipt";

    }

}
/* ==========================================
   LOAD TRANSACTIONS
========================================== */

function loadTransactions(){

    if(unsubscribe){

        unsubscribe();

    }

    const q = query(

        collection(db,"transactions"),

        where("userId","==",currentUser.uid)

    );

    unsubscribe = onSnapshot(

        q,

        (snapshot)=>{

            transactions = [];

            snapshot.forEach((document)=>{

                transactions.push({

                    id:document.id,

                    ...document.data()

                });

            });

            /* ==========================
               SORT NEWEST FIRST
            ========================== */

            transactions.sort((a,b)=>{

                if(!a.createdAt || !b.createdAt){

                    return 0;

                }

                return b.createdAt.seconds -
                       a.createdAt.seconds;

            });

            renderTransactions();

        },

        (error)=>{

            console.error(

                "Transaction Error:",

                error

            );

        }

    );

}
/* ==========================================
   RENDER TRANSACTIONS
========================================== */

function renderTransactions(){

    transactionList.innerHTML="";

    let filtered = [...transactions];

    /* ==========================
       FILTER
    ========================== */

    if(currentFilter !== "all"){

        filtered = filtered.filter(item=>

            item.type === currentFilter

        );

    }

    /* ==========================
       SEARCH
    ========================== */

    const keyword =

        searchTransaction.value

        .trim()

        .toLowerCase();

    if(keyword){

        filtered = filtered.filter(item=>

            (item.transactionId || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (item.reference || "")

            .toLowerCase()

            .includes(keyword)

        );

    }

    if(filtered.length===0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";
        filtered.forEach(item=>{

        const typeClass =

            item.type

            .toLowerCase();

        transactionList.innerHTML += `

<div class="transaction-card">

<div class="transaction-icon ${typeClass}">

<i class="fa-solid ${transactionIcon(item.type)}"></i>

</div>

<div class="transaction-content">

<div class="transaction-header">

<div>

<div class="transaction-title">

${item.type}

</div>

<div class="transaction-id">

${item.transactionId}

</div>

</div>

<div class="transaction-amount ${typeClass}">

$${Number(item.amount).toLocaleString()}

</div>

</div>

<div class="status ${item.status.toLowerCase()}">

${item.status}

</div>

<div class="transaction-meta">

<span>

<i class="fa-solid fa-calendar"></i>

${formatDate(item.createdAt)}

</span>

<span>

<i class="fa-solid fa-clock"></i>

${formatTime(item.createdAt)}

</span>

<span>

<i class="fa-solid fa-hashtag"></i>

${item.reference}

</span>

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

        filterButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTransactions();

    });

});
/* ==========================================
   SEARCH TRANSACTIONS
========================================== */

searchTransaction.addEventListener("input",()=>{

    renderTransactions();

});
/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener("click",async(e)=>{

    e.preventDefault();

    try{

        await signOut(auth);

        window.location.href="login.html";

    }catch(error){

        console.error(error);

        alert("Unable to logout.");

    }

});
/* ==========================================
   CLEANUP
========================================== */

window.addEventListener("beforeunload",()=>{

    if(unsubscribe){

        unsubscribe();

    }

});

console.log(

    "Transactions Page Ready."

);

/* ==========================================
   HTML
========================================== */

const transactionModal =
    document.getElementById("transactionModal");

const transactionDetails =
    document.getElementById("transactionDetails");

const closeTransactionModal =
    document.getElementById("closeTransactionModal");
    /* ==========================================
   OPEN TRANSACTION
========================================== */

notificationList?.addEventListener("click",()=>{});

transactionList.addEventListener("click",(e)=>{

    const card = e.target.closest(".transaction-card");

    if(!card) return;

    const id = card.dataset.id;

    const transaction =

        transactions.find(item=>item.id===id);

    if(!transaction) return;

    transactionDetails.innerHTML = `

<div class="transaction-details">

<p>

<strong>Transaction ID:</strong>

${transaction.transactionId}

</p>

<p>

<strong>Reference:</strong>

${transaction.reference}

<button
class="copy-reference"
data-reference="${transaction.reference}">

<i class="fa-solid fa-copy"></i>

</button>

</p>

<p>

<strong>Type:</strong>

${transaction.type}

</p>

<p>

<strong>Amount:</strong>

$${Number(transaction.amount).toLocaleString()}

</p>

<p>

<strong>Status:</strong>

${transaction.status}

</p>

<p>

<strong>Description:</strong>

${transaction.description}

</p>

<p>

<strong>Date:</strong>

${formatDate(transaction.createdAt)}

</p>

<p>

<strong>Time:</strong>

${formatTime(transaction.createdAt)}

</p>

</div>

`;

    transactionModal.style.display="flex";

});
/* ==========================================
   CLOSE MODAL
========================================== */

closeTransactionModal.addEventListener("click",()=>{

    transactionModal.style.display="none";

});

window.addEventListener("click",(e)=>{

    if(e.target===transactionModal){

        transactionModal.style.display="none";

    }

});
/* ==========================================
   COPY REFERENCE
========================================== */

document.addEventListener("click",async(e)=>{

    const button =

        e.target.closest(".copy-reference");

    if(!button) return;

    await navigator.clipboard.writeText(

        button.dataset.reference

    );

    button.innerHTML=

    '<i class="fa-solid fa-check"></i>';

    setTimeout(()=>{

        button.innerHTML=

        '<i class="fa-solid fa-copy"></i>';

    },2000);

});
