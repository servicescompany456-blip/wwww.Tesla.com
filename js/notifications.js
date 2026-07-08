import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================================
   HTML ELEMENTS
========================================== */

const notificationList =
    document.getElementById("notificationList");

const unreadCount =
    document.getElementById("unreadCount");

const emptyState =
    document.getElementById("emptyState");

const markAllRead =
    document.getElementById("markAllRead");

const logoutBtn =
    document.getElementById("logoutBtn");

const deleteModal =
    document.getElementById("deleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");

const filterButtons =
    document.querySelectorAll(".filter-btn");


let currentUser = null;

let notifications = [];

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

    loadNotifications();

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

function notificationIcon(type){

    switch(type){

        case "deposit":

            return "fa-money-bill-transfer";

        case "withdrawal":

            return "fa-wallet";

        case "investment":

            return "fa-chart-line";

        case "profit":

            return "fa-coins";

        case "success":

            return "fa-circle-check";

        case "warning":

            return "fa-triangle-exclamation";

        case "error":

            return "fa-circle-xmark";

        default:

            return "fa-bell";

    }

}
/* ==========================================
   LOAD NOTIFICATIONS
========================================== */

function loadNotifications(){

    if(unsubscribe){

        unsubscribe();

    }

    const q = query(

        collection(db,"notifications"),

        where("userId","==",currentUser.uid)

    );

    unsubscribe = onSnapshot(

        q,

        (snapshot)=>{

            notifications = [];

            snapshot.forEach((document)=>{

                notifications.push({

                    id:document.id,

                    ...document.data()

                });

            });

            /* ==========================
               SORT NEWEST FIRST
            ========================== */

            notifications.sort((a,b)=>{

                if(!a.createdAt || !b.createdAt){

                    return 0;

                }

                return b.createdAt.seconds -
                       a.createdAt.seconds;

            });

            renderNotifications();

        },

        (error)=>{

            console.error(

                "Notification Error:",

                error

            );

        }

    );

}
/* ==========================================
   RENDER NOTIFICATIONS
========================================== */

function renderNotifications(){

    notificationList.innerHTML = "";

    let unread = 0;

    const filteredNotifications = notifications.filter(item=>{

        if(currentFilter==="all"){

            return true;

        }

        return item.type===currentFilter;

    });

    if(filteredNotifications.length===0){

        emptyState.style.display="block";

        unreadCount.textContent="0";

        return;

    }

    emptyState.style.display="none";
        filteredNotifications.forEach(item=>{

        if(!item.read){

            unread++;

        }

        notificationList.innerHTML += `

        <div class="notification-card ${item.read ? "":"unread"}">

            <div class="notification-icon ${item.type}">

                <i class="fa-solid ${notificationIcon(item.type)}"></i>

            </div>

            <div class="notification-content">

                <h3>${item.title}</h3>

                <p>${item.message}</p>

                <div class="notification-meta">

                    <span>

                        📅 ${formatDate(item.createdAt)}

                    </span>

                    <span class="notification-time">

                        🕒 ${formatTime(item.createdAt)}

                    </span>

                </div>

            </div>

        </div>

        `;

    });

    unreadCount.textContent = unread;

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

        renderNotifications();

    });

});
/* ==========================================
   MARK ALL AS READ
========================================== */

markAllRead.addEventListener("click",async()=>{

    try{

        const unreadNotifications = notifications.filter(item=>!item.read);

        for(const item of unreadNotifications){

            await updateDoc(

                doc(db,"notifications",item.id),

                {

                    read:true

                }

            );

        }

    }catch(error){

        console.error(error);

    }

});
/* ==========================================
   DELETE ALL MODAL
========================================== */

markAllRead.addEventListener("contextmenu",(e)=>{

    e.preventDefault();

    deleteModal.style.display="flex";

});


cancelDelete.addEventListener("click",()=>{

    deleteModal.style.display="none";

});


window.addEventListener("click",(e)=>{

    if(e.target===deleteModal){

        deleteModal.style.display="none";

    }

});
/* ==========================================
   DELETE ALL NOTIFICATIONS
========================================== */

confirmDelete.addEventListener("click",async()=>{

    try{

        for(const item of notifications){

            await deleteDoc(

                doc(db,"notifications",item.id)

            );

        }

        deleteModal.style.display="none";

    }catch(error){

        console.error(error);

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

    }catch(error){

        console.error(error);

    }

});
/* ==========================================
   MARK SINGLE NOTIFICATION AS READ
========================================== */

notificationList.addEventListener("click", async(e)=>{

    const card = e.target.closest(".notification-card");

    if(!card) return;

    const id = card.dataset.id;

    if(!id) return;

    const notification = notifications.find(

        item => item.id === id

    );

    if(!notification) return;

    if(notification.read) return;

    try{

        await updateDoc(

            doc(db,"notifications",id),

            {

                read:true

            }

        );

    }catch(error){

        console.error(error);

    }

});
/* ==========================================
   DELETE SINGLE NOTIFICATION
========================================== */

notificationList.addEventListener("click", async(e)=>{

    const deleteButton =

        e.target.closest(".delete-single");

    if(!deleteButton) return;

    e.stopPropagation();

    try{

        await deleteDoc(

            doc(

                db,

                "notifications",

                deleteButton.dataset.id

            )

        );

    }catch(error){

        console.error(error);

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

    "Notification Center Ready."

);