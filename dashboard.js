import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ADMIN_EMAIL = "badumisanathan807@gmail.com";
const TOTAL_MODULES = 18;

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

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Admin link
    const adminLink = document.getElementById("admin-link");
    if (user.email === ADMIN_EMAIL && adminLink) {
        adminLink.style.display = "flex";
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();

            /* --- Message de bienvenue --- */
            const welcomeMessage = document.getElementById("welcome-message");
            if (welcomeMessage) {
                welcomeMessage.innerHTML = `Bienvenue ${data.username || data.name || "Trader"} 🔥`;
            }

            /* --- Progression depuis modulesTermines --- */
            const modulesTermines = data.modulesTermines || [];
            const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);

            const progressFill = document.getElementById("progress-fill");
            const progressText = document.getElementById("progress-text");

            if (progressFill) {
                progressFill.style.width = `${progression}%`;
                progressFill.innerHTML = `${progression}%`;
            }
            if (progressText) progressText.innerHTML = `${progression}% terminé`;

            /* --- Badge premium --- */
            const premiumBadge = document.querySelector(".premium-badge");
            if (premiumBadge) {
                if (data.premium) {
                    premiumBadge.innerHTML = `<i class="fa-solid fa-crown"></i><span>Premium Student</span>`;
                } else {
                    premiumBadge.innerHTML = `<i class="fa-solid fa-lock"></i><span>Compte Standard</span>`;
                }
            }
        }

        /* --- Annonce depuis Firebase (collection announcements) --- */
        const announcementSnap = await getDoc(doc(db, "announcements", "latest"));
        const announcementEl = document.getElementById("announcement-message");

        if (announcementEl) {
            if (announcementSnap.exists() && announcementSnap.data().message) {
                announcementEl.innerHTML = announcementSnap.data().message;
            } else {
                announcementEl.innerHTML = "Bienvenue au sein de la Nathan Trading Academy. Restez discipliné et maîtrisez votre plan de trading ! 📉🚀";
            }
        }

    } catch (error) {
        console.error("Erreur dashboard :", error);
    }
});

/* --- Déconnexion --- */
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Erreur déconnexion :", error);
        }
    });
}