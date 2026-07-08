/* ==========================================
   TESLA INVESTMENT SUPPORT CHAT
========================================== */

import { auth, db } from "./firebase.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {

    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
/* ==========================================
GET ELEMENTS
========================================== */

const messageForm = document.getElementById("messageForm");

const messageInput = document.getElementById("messageInput");

const chatMessages = document.getElementById("chatMessages");

const charCount = document.getElementById("charCount");

const loadingOverlay = document.getElementById("loadingOverlay");

const successToast = document.getElementById("successToast");

const errorToast = document.getElementById("errorToast");
/* ==========================================
CURRENT USER
========================================== */

let currentUser = null;
/* ==========================================
AUTH CHECK
========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        // window.location.href = "login.html";

        return;

    }

    currentUser = user;

    // console.log("Logged in as:", user.email);

});
/* ==========================================
CHARACTER COUNTER
========================================== */

messageInput.addEventListener("input", () => {

    charCount.textContent = messageInput.value.length;

});
/* ==========================================
SHOW TOAST
========================================== */

function showToast(toast) {

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}
/* ==========================================
SEND MESSAGE
========================================== */

messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser) return;

    const text = messageInput.value.trim();

    if (text === "") return;

    loadingOverlay.style.display = "flex";
        try {

        await addDoc(collection(db, "messages"), {

            senderId: currentUser.uid,

            senderEmail: currentUser.email,

            senderName:

            currentUser.displayName ||

            "Tesla User",

            text: text,

            from: "user",

            createdAt: serverTimestamp(),

            seen: false

        });
                messageInput.value = "";

        charCount.textContent = "0";

        loadingOverlay.style.display = "none";

        showToast(successToast);

    }
        catch (error) {

        console.error(error);

        loadingOverlay.style.display = "none";

        showToast(errorToast);

    }

});
/* ==========================================
REAL-TIME CHAT
========================================== */

const messagesQuery = query(

    collection(db, "messages"),

    orderBy("createdAt", "asc")

);

onSnapshot(messagesQuery, (snapshot) => {

    chatMessages.innerHTML = "";
        snapshot.forEach((doc) => {

        const data = doc.data();

        const message = document.createElement("div");

        message.classList.add("message");
                if (data.from === "user") {

            message.classList.add("user");

        } else {

            message.classList.add("support");

        }
                const time = data.createdAt
            ? data.createdAt.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
              })
            : "Now";
                    message.innerHTML = `

            <div class="message-text">

                ${data.text}

            </div>

            <div class="message-time">

                ${time}

            </div>

        `;
                chatMessages.appendChild(message);

    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

});
/* ==========================================
REAL-TIME PRIVATE CHAT
========================================== */

function loadMessages() {

    if (!currentUser) return;

    const messagesQuery = query(

        collection(db, "messages"),

        where("senderId", "==", currentUser.uid),

        orderBy("createdAt", "asc")

    );

    onSnapshot(messagesQuery, (snapshot) => {

        chatMessages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            const message = document.createElement("div");

            message.classList.add("message");

            if (data.from === "user") {

                message.classList.add("user");

            }

            else {

                message.classList.add("support");

            }

            const time = data.createdAt
                ? data.createdAt.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                  })
                : "Now";

            message.innerHTML = `

                <div class="message-text">

                    ${data.text}

                </div>

                <div class="message-time">

                    ${time}

                </div>

            `;

            chatMessages.appendChild(message);

        });

        chatMessages.scrollTop = chatMessages.scrollHeight;

    });

}
/* ==========================================
LOAD CHAT AFTER LOGIN
========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        // window.location.href = "login.html";

        return;

    }

    currentUser = user;

    // console.log("Logged in:", user.email);

    loadMessages();

});
/* ==========================================
EMOJI PICKER
========================================== */

const emojiPicker = document.getElementById("emojiPicker");

const emojiBtn = document.querySelector(".emoji-btn");

if (emojiBtn && emojiPicker) {

    emojiBtn.addEventListener("click", () => {

        emojiPicker.style.display =
            emojiPicker.style.display === "flex"
                ? "none"
                : "flex";

    });

    emojiPicker.querySelectorAll("span").forEach(emoji => {

        emoji.addEventListener("click", () => {

            messageInput.value += emoji.textContent;

            charCount.textContent = messageInput.value.length;

            messageInput.focus();

            emojiPicker.style.display = "none";

        });

    });

}
/* ==========================================
ATTACHMENT BUTTON
========================================== */

const attachmentInput = document.getElementById("attachmentInput");

const attachBtn = document.querySelector(".attach-btn");

if (attachBtn && attachmentInput) {

    attachBtn.addEventListener("click", () => {

        attachmentInput.click();

    });

    attachmentInput.addEventListener("change", () => {

        if (attachmentInput.files.length > 0) {

            alert(
                "Image uploads will be enabled in the next update."
            );

        }

    });

}
/* ==========================================
REFRESH CHAT
========================================== */

const refreshChat = document.getElementById("refreshChat");

if (refreshChat) {

    refreshChat.addEventListener("click", () => {

        location.reload();

    });

}
/* ==========================================
CHAT INFO
========================================== */

const chatInfo = document.getElementById("chatInfo");

if (chatInfo) {

    chatInfo.addEventListener("click", () => {

        alert(

`Tesla Investment Support

Business Hours:
Monday - Friday
9:00 AM - 5:00 PM

Average response:
5 - 30 minutes.

Your messages are securely stored.`

        );

    });

}
/* ==========================================
CLICK OUTSIDE EMOJI PICKER
========================================== */

document.addEventListener("click", (event) => {

    if (
        emojiPicker &&
        emojiBtn &&
        !emojiPicker.contains(event.target) &&
        !emojiBtn.contains(event.target)
    ) {

        emojiPicker.style.display = "none";

    }

});
/* ==========================================
READY
========================================== */

window.addEventListener("load", () => {

    console.clear();

    console.log(
        "%cTesla Investment Support Chat",
        "color:#0095F6;font-size:18px;font-weight:bold;"
    );

    console.log(
        "%cSupport chat initialized successfully.",
        "color:green;font-size:14px;"
    );

});

