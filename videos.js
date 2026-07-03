import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ===========================
   FIREBASE
=========================== */

const firebaseConfig = {
    apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
    authDomain: "nathan-trading.firebaseapp.com",
    projectId: "nathan-trading",
    storageBucket: "nathan-trading.firebasestorage.app",
    messagingSenderId: "908084098772",
    appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================
   VIDEOS PREMIUM
=========================== */

const premiumVideos = {

    // INTRODUCTION
    1: "https://iframe.mediadelivery.net/embed/682167/f4c635f5-ba3d-4281-9a06-9723eadeb1bb?autoplay=false&preload=false",

    // MODULES 1 à 7
    2: "https://iframe.mediadelivery.net/embed/682167/00260c83-1506-4715-bb86-8e8a8f7a5d05?autoplay=false&preload=false",
    3: "https://iframe.mediadelivery.net/embed/682167/687d44ed-39cf-4fe2-b44f-a03b651aab31?autoplay=false&preload=false",
    4: "https://iframe.mediadelivery.net/embed/682167/543411c3-dd5d-4c05-9a67-e2c61ac59cfd?autoplay=false&preload=false",
    5: "https://iframe.mediadelivery.net/embed/682167/409f25ba-06f7-4680-9684-e7dc92e957d8?autoplay=false&preload=false",
    6: "https://iframe.mediadelivery.net/embed/682167/c38276c8-4672-49f4-8a0a-e28456281506?autoplay=false&preload=false",
    7: "https://iframe.mediadelivery.net/embed/682167/b8a9f640-95ba-4ccd-be8a-4eab50fc7879?autoplay=false&preload=false",
    8: "https://iframe.mediadelivery.net/embed/682167/87684ed3-2df8-41fd-b7bf-e5d0cec96c21?autoplay=false&preload=false",

    // MODULE 8
    9: "https://player.mediadelivery.net/embed/682167/cb38cabd-b139-4581-9fe4-47d8d457f700?autoplay=false",
    10: "https://player.mediadelivery.net/embed/682167/22e0264f-ac75-41c3-b30a-56b403dc97c1?autoplay=false",
    11: "https://player.mediadelivery.net/embed/682167/f9d8e428-e0e2-4fbc-a8e7-c5c609ed9b91?autoplay=false",
    12: "https://player.mediadelivery.net/embed/682167/9d3e39bb-e348-40a0-8ad9-5d2cb75a2d7c?autoplay=false",
    13: "https://player.mediadelivery.net/embed/682167/60c08261-75dc-4e7b-af75-5dd6745c81ba?autoplay=false",

    // MODULES 9 à 11
    14: "https://player.mediadelivery.net/embed/682167/44011b7f-8893-487b-8082-747eef456a45?autoplay=false",
    15: "https://player.mediadelivery.net/embed/682167/c5a278a0-d031-46d9-bbfe-7d0aea822a67?autoplay=false",
    16: "https://player.mediadelivery.net/embed/682167/0188751b-c06a-45b4-abd8-047438abc376?autoplay=false",

    // MODULES 12 & 13
    17: "https://player.mediadelivery.net/embed/682167/ba7ac687-ac72-4506-8afd-66a0a6103831?autoplay=false",

    // CONCLUSION
    18: "https://player.mediadelivery.net/embed/682167/d1b287c9-7e11-4540-8928-2e37077b352b?autoplay=false"
};

/* ===========================
   AUTH
=========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.replace("index.html");
        return;
    }

    try {

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            window.location.replace("index.html");
            return;
        }

        const userData = userSnap.data();

        if (!userData.premium) {
            alert("Accès réservé aux élèves Premium.");
            window.location.replace("payment.html");
            return;
        }

        /* ===========================
           CHARGEMENT DES VIDEOS
        =========================== */

        Object.entries(premiumVideos).forEach(([id, url]) => {

            const container = document.getElementById(`video-${id}`);

            if (!container) return;

            container.innerHTML = `
                <iframe
                    src="${url}"
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen
                    style="
                        width:100%;
                        height:480px;
                        border:none;
                        border-radius:16px;
                        background:#000;
                    ">
                </iframe>
            `;
        });

        /* ===========================
           MODULES
        =========================== */

        // TEMPORAIRE : tout débloquer
        const currentModuleIndex = 18;

        const modules =
            document.querySelectorAll(".video-card");

        modules.forEach((module, index) => {

            const btn =
                module.querySelector(".complete-btn");

            const overlay =
                module.querySelector(".locked-overlay");

            const status =
                module.querySelector(".module-status");

            const video =
                module.querySelector(".video-container");

            // Module débloqué
            if (index <= currentModuleIndex) {

                module.classList.remove("locked");
                module.classList.add("unlocked");

                if (overlay)
                    overlay.style.display = "none";

                if (video) {
                    video.style.filter = "none";
                    video.style.pointerEvents = "auto";
                }

                if (btn) {
                    btn.disabled = false;
                    btn.style.cursor = "pointer";
                }

                if (status) {
                    status.className =
                        "module-status completed";

                    status.innerHTML =
                        "Disponible";
                }
            }

            // Module verrouillé
            else {

                module.classList.add("locked");

                if (video) {
                    video.style.filter = "blur(12px)";
                    video.style.pointerEvents = "none";
                }

                if (btn)
                    btn.disabled = true;

                if (status) {

                    status.className =
                        "module-status locked-status";

                    status.innerHTML =
                        "Verrouillé";
                }
            }
        });

        /* ===========================
           PROGRESSION
        =========================== */

        const progressText =
            document.getElementById("progress-text");

        const progressFill =
            document.getElementById("progress-fill");

        const progression =
            userData.progression || 0;

        if (progressText)
            progressText.innerText =
                `${progression}% terminé`;

        if (progressFill) {

            progressFill.style.width =
                `${progression}%`;

            progressFill.innerText =
                `${progression}%`;
        }

    } catch (error) {

        console.error(
            "Erreur videos.js :",
            error
        );

        alert(
            "Erreur lors du chargement des vidéos."
        );

        window.location.replace(
            "index.html"
        );
    }
});
