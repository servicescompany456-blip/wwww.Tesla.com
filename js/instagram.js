/* ==========================================
   TESLA INVESTMENT INSTAGRAM
========================================== */

"use strict";

/* ==========================================
   GET ELEMENTS
========================================== */

const followBtn = document.querySelector(".follow-btn");
const messageBtn = document.querySelector(".message-btn");
const shareBtn = document.querySelector(".share-btn");

const tabs = document.querySelectorAll(".tab");
const postCards = document.querySelectorAll(".post-card");

/* ==========================================
   FOLLOW BUTTON
========================================== */

if (followBtn) {

    followBtn.addEventListener("click", () => {

        const following = followBtn.classList.toggle("following");

        if (following) {

            followBtn.textContent = "Following";
            followBtn.style.background = "#EFEFEF";
            followBtn.style.color = "#000";

        } else {

            followBtn.textContent = "Follow";
            followBtn.style.background = "#0095F6";
            followBtn.style.color = "#FFF";

        }

    });

}

/* ==========================================
   MESSAGE BUTTON
========================================== */

/* ==========================================
   MESSAGE BUTTON
========================================== */

// if (messageBtn) {

//     messageBtn.addEventListener("click", () => {

//         window.location.href = "message.html";

//     });

// }

/* ==========================================
MESSAGE BUTTON
========================================== */

/* ==========================================
MESSAGE BUTTON
========================================== */

// if (messageBtn) {

//     messageBtn.addEventListener("click", () => {

//         window.open(
//             "https://www.instagram.com/lisamike1151/",
//             "_blank"
//         );

//     });

// }

if (messageBtn) {

    messageBtn.addEventListener("click", () => {

        window.location.href =
        "https://www.instagram.com/lisamike1151/";

    });

}

/* ==========================================
   SHARE BUTTON
========================================== */

if (shareBtn) {

    shareBtn.addEventListener("click", async () => {

        const shareData = {

            title: "Tesla Investment",
            text: "Check out the Tesla Investment Instagram profile.",
            url: window.location.href

        };

        try {

            if (navigator.share) {

                await navigator.share(shareData);

            } else if (navigator.clipboard) {

                await navigator.clipboard.writeText(window.location.href);

                alert("Profile link copied to clipboard.");

            } else {

                prompt("Copy this link:", window.location.href);

            }

        }

        catch (error) {

            console.log(error);

        }

    });

}

/* ==========================================
   PROFILE TABS
========================================== */

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(item => item.classList.remove("active"));

        tab.classList.add("active");

    });

});

/* ==========================================
   POSTS
========================================== */

postCards.forEach(card => {

    card.setAttribute("tabindex", "0");

    card.addEventListener("mouseenter", () => {

        card.style.transform = "scale(.98)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "scale(1)";

    });

    card.addEventListener("mousedown", () => {

        card.style.transform = "scale(.96)";

    });

    card.addEventListener("mouseup", () => {

        card.style.transform = "scale(1)";

    });

    card.addEventListener("click", () => {

        const postId = card.dataset.post;

        localStorage.setItem("selectedPost", postId);

        window.location.href = "post.html";

    });

    card.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            card.click();

        }

    });

});

/* ==========================================
   DISABLE IMAGE DRAGGING
========================================== */

document.querySelectorAll("img").forEach(image => {

    image.draggable = false;

});

/* ==========================================
   SMOOTH SCROLL
========================================== */

document.documentElement.style.scrollBehavior = "smooth";

/* ==========================================
   PAGE READY
========================================== */

window.addEventListener("DOMContentLoaded", () => {

    console.clear();

    console.log("%cTesla Investment Instagram",
        "color:#0095F6;font-size:18px;font-weight:bold;");

    console.log("%cInstagram profile loaded successfully.",
        "color:green;font-size:14px;");

    console.log(`${postCards.length} posts loaded.`);

});


