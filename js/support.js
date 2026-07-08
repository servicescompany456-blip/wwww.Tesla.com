import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
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

const profileImage =
document.getElementById("profileImage");

const profileName =
document.getElementById("profileName");

const profileEmail =
document.getElementById("profileEmail");

const supportForm =
document.getElementById("supportForm");

const subject =
document.getElementById("subject");

const category =
document.getElementById("category");

const priority =
document.getElementById("priority");

const message =
document.getElementById("message");

const ticketList =
document.getElementById("ticketList");

const telegramSupport =
document.getElementById("telegramSupport");

const alertBox =
document.getElementById("alertBox");
/* ==========================================
GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentUserData = {};
/* ==========================================
ALERT
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
DATE FORMAT
========================================== */

function formatDate(timestamp){

    if(!timestamp?.toDate){

        return "-";

    }

    return timestamp.toDate()

    .toLocaleString(undefined,{

        day:"numeric",

        month:"short",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}
/* ==========================================
GENERATE TICKET ID
========================================== */

function generateTicketId(){

    return "SUP-" +

    Date.now();

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

        loadProfile();

        await loadTickets();

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
LOAD PROFILE
========================================== */

function loadProfile(){

    profileName.textContent =

        currentUserData.fullName || "User";

    profileEmail.textContent =

        currentUserData.email || "";

    if(currentUserData.photoURL){

        profileImage.src =

            currentUserData.photoURL;

    }

}
/* ==========================================
LOAD USER SUPPORT TICKETS
========================================== */

async function loadTickets(){

    try{

        const q = query(

            collection(db,"supportTickets"),

            where("userId","==",currentUser.uid),

            orderBy("createdAt","desc")

        );

        const snapshot = await getDocs(q);

        ticketList.innerHTML = "";

        if(snapshot.empty){

            ticketList.innerHTML = `

            <div class="loading-card">

                <i class="fa-solid fa-inbox"></i>

                <p>No support tickets found.</p>

            </div>

            `;

            return;

        }
                snapshot.forEach(doc=>{

            const data = doc.data();

            let badge = "badge-open";

            if(data.status === "Pending"){

                badge = "badge-pending";

            }

            if(data.status === "Closed"){

                badge = "badge-closed";

            }

            ticketList.innerHTML += `

            <div class="ticket-item">

                <div class="ticket-info">

                    <h4>${data.subject}</h4>

                    <p>${data.message}</p>

                    <div class="ticket-meta">

                        <span><strong>ID:</strong> ${data.ticketId}</span>

                        <span><strong>Category:</strong> ${data.category}</span>

                        <span><strong>Priority:</strong> ${data.priority}</span>

                    </div>
                                        ${
                        data.adminReply
                        ? `<p><strong>Admin Reply:</strong> ${data.adminReply}</p>`
                        : ""
                    }

                </div>

                <div>

                    <span class="badge ${badge}">

                        ${data.status}

                    </span>

                    <p style="margin-top:10px;font-size:13px;color:#6B7280;">

                        ${formatDate(data.createdAt)}

                    </p>

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}
/* ==========================================
SUBMIT SUPPORT TICKET
========================================== */

supportForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    if(!currentUser){

        return;

    }

    try{

        const ticketId = generateTicketId();

        await addDoc(

            collection(db,"supportTickets"),

            {

                ticketId,

                userId:currentUser.uid,

                fullName:currentUserData.fullName,

                email:currentUserData.email,

                subject:subject.value.trim(),

                category:category.value,

                priority:priority.value,

                message:message.value.trim(),

                status:"Open",

                adminReply:"",

                createdAt:serverTimestamp(),

                updatedAt:serverTimestamp()

            }

        );
                /* ==========================================
        CREATE NOTIFICATION
        ========================================== */

        await addDoc(

            collection(db,"notifications"),

            {

                userId:currentUser.uid,

                title:"Support Ticket Submitted",

                message:`Your support ticket "${subject.value.trim()}" has been received. Our support team will respond as soon as possible.`,

                type:"support",

                read:false,

                createdAt:serverTimestamp()

            }

        );
                showAlert(

            "Support ticket submitted successfully."

        );

        supportForm.reset();

        await loadTickets();

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
AUTO REFRESH TICKETS
========================================== */

setInterval(()=>{

    if(currentUser){

        loadTickets();

    }

},30000);
/* ==========================================
TELEGRAM SUPPORT
========================================== */

telegramSupport.addEventListener("click",()=>{

    console.log(

        "Opening Telegram Support..."

    );

});
/* ==========================================
PAGE READY
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log(

        "Support Center Loaded Successfully."

    );

});
