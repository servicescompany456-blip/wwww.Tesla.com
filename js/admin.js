import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const adminName = document.getElementById("adminName");

const adminImage = document.getElementById("adminImage");

const totalUsers = document.getElementById("totalUsers");

const totalDeposits = document.getElementById("totalDeposits");

const totalWithdrawals = document.getElementById("totalWithdrawals");

const totalInvestments = document.getElementById("totalInvestments");

const usersTable = document.getElementById("usersTable");

const logoutBtn = document.getElementById("logoutBtn");

const searchUser = document.getElementById("searchUser");


let allUsers = [];


/* ==========================================
   MONEY FORMAT
========================================== */

function money(value){

    return "$" + Number(value || 0).toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });

}


/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    try{

        const snap = await getDoc(
            doc(db,"users",user.uid)
        );

        if(!snap.exists()){

            window.location.href="dashboard.html";

            return;

        }

        const admin = snap.data();

        if(admin.role !== "admin"){

            alert("Access Denied");

            window.location.href="dashboard.html";

            return;

        }

        adminName.textContent =
            admin.fullName;

        if(admin.profileImage){

            adminImage.src =
                admin.profileImage;

        }

        loadUsers();

    }catch(error){

        console.error(error);

    }

});
/* ==========================================
   LOAD USERS
========================================== */

async function loadUsers(){

    const q = query(
        collection(db,"users")
    );

    const snapshot =
        await getDocs(q);

    allUsers = [];

    let deposits = 0;

    let withdrawals = 0;

    let investments = 0;

    usersTable.innerHTML="";

    snapshot.forEach((docSnap)=>{

        const user = docSnap.data();

        user.id = docSnap.id;

        allUsers.push(user);

        deposits += Number(
            user.totalDeposits || 0
        );

        withdrawals += Number(
            user.totalWithdrawals || 0
        );

        investments += Number(
            user.totalInvestment || 0
        );

        usersTable.innerHTML += `

        <tr>

        <td>

        <img
        src="${
            user.profileImage ||
            'images/avatar.png'
        }"
        class="user-photo">

        </td>

        <td>

        ${user.fullName}

        </td>

        <td>

        ${user.email}

        </td>

        <td>

        ${money(user.balance)}

        </td>

        <td>

        ${money(user.portfolio)}

        </td>

        <td>

        <span class="status ${user.accountStatus}">

        ${user.accountStatus}

        </span>

        </td>

        <td>

        <button
        class="edit-btn"
        onclick="editUser('${user.id}')">

        Edit

        </button>

        </td>

        </tr>

        `;

    });

    totalUsers.textContent =
        allUsers.length;

    totalDeposits.textContent =
        money(deposits);

    totalWithdrawals.textContent =
        money(withdrawals);

    totalInvestments.textContent =
        money(investments);

}

/* ==========================================
   EDIT USER
========================================== */

import {
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const editModal = document.getElementById("editModal");

const closeModal = document.getElementById("closeModal");

const saveUser = document.getElementById("saveUser");

const editUserId = document.getElementById("editUserId");

const editBalance = document.getElementById("editBalance");

const editPortfolio = document.getElementById("editPortfolio");

const editDeposits = document.getElementById("editDeposits");

const editWithdrawals = document.getElementById("editWithdrawals");

const editProfit = document.getElementById("editProfit");

const editStatus = document.getElementById("editStatus");


function editUser(id){

    const user = allUsers.find(u => u.id === id);

    if(!user) return;

    editUserId.value = id;

    editBalance.value = user.balance || 0;

    editPortfolio.value = user.portfolio || 0;

    editDeposits.value = user.totalDeposits || 0;

    editWithdrawals.value = user.totalWithdrawals || 0;

    editProfit.value = user.totalProfit || 0;

    editStatus.value = user.accountStatus || "active";

    editModal.style.display = "flex";

}

window.editUser = editUser;


/* ==========================================
   CLOSE MODAL
========================================== */

closeModal.addEventListener("click",()=>{

    editModal.style.display="none";

});

window.addEventListener("click",(e)=>{

    if(e.target===editModal){

        editModal.style.display="none";

    }

});

/* ==========================================
   SAVE USER
========================================== */

saveUser.addEventListener("click",async()=>{

    try{

        await updateDoc(

            doc(db,"users",editUserId.value),

            {

                balance:Number(editBalance.value),

                portfolio:Number(editPortfolio.value),

                totalDeposits:Number(editDeposits.value),

                totalWithdrawals:Number(editWithdrawals.value),

                totalProfit:Number(editProfit.value),

                accountStatus:editStatus.value

            }

        );

        alert("User updated successfully.");

        editModal.style.display="none";

        loadUsers();

    }catch(error){

        console.error(error);

        alert(error.message);

    }

});

/* ==========================================
   SEARCH USERS
========================================== */

searchUser.addEventListener("keyup",()=>{

    const value =
        searchUser.value.toLowerCase();

    const rows =
        usersTable.querySelectorAll("tr");

    rows.forEach(row=>{

        const text =
            row.innerText.toLowerCase();

        row.style.display =
            text.includes(value)
            ? ""
            : "none";

    });

});


/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener("click",async(e)=>{

    e.preventDefault();

    if(!confirm("Logout Admin?")) return;

    await signOut(auth);

    window.location.href="login.html";

});

