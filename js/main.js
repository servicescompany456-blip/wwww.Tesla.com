/*=========================================================
  TELSA INVESTMENT
  main.js - Part 1
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       MOBILE MENU
    ========================== */

    const menuBtn = document.querySelector(".menu-btn");
    const navbar = document.querySelector(".navbar");

    if (menuBtn && navbar) {

        menuBtn.addEventListener("click", () => {

            navbar.classList.toggle("active");

            const icon = menuBtn.querySelector("i");

            if (navbar.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }

        });

        // Close menu when a link is clicked
        document.querySelectorAll(".navbar a").forEach(link => {

            link.addEventListener("click", () => {

                navbar.classList.remove("active");

                const icon = menuBtn.querySelector("i");
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

            });

        });

    }

    /* =========================
       STICKY HEADER EFFECT
    ========================== */

    const header = document.querySelector(".header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 60) {

            header.style.background = "#071b34";
            header.style.boxShadow = "0 10px 25px rgba(0,0,0,.18)";

        } else {

            header.style.background = "rgba(13,43,82,.95)";
            header.style.boxShadow = "0 8px 25px rgba(0,0,0,.15)";

        }

    }

    updateHeader();

    window.addEventListener("scroll", updateHeader);

    /* =========================
       SCROLL TO TOP BUTTON
    ========================== */

    const scrollTopBtn = document.getElementById("scrollTop");

    function toggleScrollButton() {

        if (!scrollTopBtn) return;

        if (window.scrollY > 400) {

            scrollTopBtn.classList.add("show");

        } else {

            scrollTopBtn.classList.remove("show");

        }

    }

    toggleScrollButton();

    window.addEventListener("scroll", toggleScrollButton);

    if (scrollTopBtn) {

        scrollTopBtn.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        });

    }

    /* =========================
       SMOOTH SCROLL
    ========================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

    });

});

/*=========================================================
  TELSA INVESTMENT
  main.js - Part 2
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*==========================
      FAQ ACCORDION
    ==========================*/

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {

            faqItems.forEach(other => {

                if (other !== item) {
                    other.classList.remove("active");
                }

            });

            item.classList.toggle("active");

        });

    });


    /*==========================
      INVESTMENT CALCULATOR
    ==========================*/

    const amountInput = document.getElementById("amount");
    const rateInput = document.getElementById("rate");
    const yearsInput = document.getElementById("years");
    const result = document.getElementById("result");
    const calculateBtn = document.getElementById("calculateBtn");

    if (
        amountInput &&
        rateInput &&
        yearsInput &&
        result &&
        calculateBtn
    ) {

        calculateBtn.addEventListener("click", () => {

            const principal = parseFloat(amountInput.value);
            const annualRate = parseFloat(rateInput.value);
            const years = parseFloat(yearsInput.value);

            if (
                isNaN(principal) ||
                isNaN(annualRate) ||
                isNaN(years)
            ) {

                result.textContent = "Enter valid values";

                return;

            }

            if (
                principal <= 0 ||
                annualRate < 0 ||
                years <= 0
            ) {

                result.textContent = "Invalid values";

                return;

            }

            // Compound annually
            const futureValue =
                principal *
                Math.pow(1 + annualRate / 100, years);

            result.textContent =
                "$" +
                futureValue.toLocaleString(undefined, {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                });

        });

    }


    /*==========================
      ANIMATED COUNTERS
    ==========================*/

    const counters = document.querySelectorAll(
        ".hero-stats h2, .stat-box h1"
    );

    const speed = 40;

    const animateCounter = (counter) => {

        const text = counter.textContent;

        let target = parseFloat(
            text.replace(/[^0-9.]/g, "")
        );

        if (isNaN(target)) return;

        let current = 0;

        const increment = target / 80;

        const timer = setInterval(() => {

            current += increment;

            if (current >= target) {

                current = target;

                clearInterval(timer);

            }

            let display;

            if (text.includes("%")) {

                display =
                    current.toFixed(1) + "%";

            }
            else if (text.includes("$")) {

                display =
                    "$" +
                    Math.floor(current)
                    .toLocaleString();

                if (text.includes("M")) {

                    display += "M+";

                }

            }
            else {

                display =
                    Math.floor(current)
                    .toLocaleString();

                if (text.includes("K")) {

                    display += "K+";

                }
                else if (text.includes("+")) {

                    display += "+";

                }

            }

            counter.textContent = display;

        }, speed);

    };


    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    animateCounter(entry.target);

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold:0.6
        }

    );

    counters.forEach(counter => {

        observer.observe(counter);

    });

});

/* ==========================================
CONTACT FORM (FORMSPREE)
========================================== */

const contactForm = document.getElementById("contactForm");

if(contactForm){

const contactBtn =
document.getElementById("contactBtn");

const contactText =
document.getElementById("contactText");

const contactLoading =
document.getElementById("contactLoading");

const contactAlert =
document.getElementById("contactAlert");

contactForm.addEventListener("submit",async(e)=>{

e.preventDefault();

contactBtn.disabled = true;

contactText.style.display = "none";

contactLoading.style.display = "inline";

contactAlert.innerHTML = "";

const formData = new FormData(contactForm);

try{

const response = await fetch(

"https://formspree.io/f/xqevwvzn",

{

method:"POST",

body:formData,

headers:{

Accept:"application/json"

}

}

);

if(response.ok){

contactAlert.innerHTML =

`<div class="success-message">

✅ Your message has been sent successfully.

We'll get back to you shortly.

</div>`;

contactForm.reset();

}else{

throw new Error();

}

}catch{

contactAlert.innerHTML =

`<div class="error-message">

❌ Unable to send your message.

Please try again later.

</div>`;

}

contactBtn.disabled = false;

contactText.style.display = "";

contactLoading.style.display = "none";

});

}
