import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ADMIN_EMAIL = "badumisanathan807@gmail.com";

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

const TOTAL_MODULES = 18;

const nomsModules = {
    1:  "Introduction",
    2:  "Module 1 — Les bases d'une stratégie",
    3:  "Module 2 — Comment le prix bouge",
    4:  "Module 3 — La structure du marché",
    5:  "Module 4 — Les zones solides",
    6:  "Module 5 — Les deux patterns",
    7:  "Module 6 — Le clean trafic",
    8:  "Module 7 — Analyse du biais",
    9:  "Module 8.1 — Avalement CP Zone D1",
    10: "Module 8.2 — Avalement CP Zone D1 Suite",
    11: "Module 8.3 — Avalement H4",
    12: "Module 8.4 — Doji Marteau H4",
    13: "Module 8.5 — Avalement H4-H1 + M15",
    14: "Module 9 — Gestion du risque",
    15: "Module 10 — Gestion du trade",
    16: "Module 11 — Gestion des émotions",
    17: "Modules 12 & 13 — Plan & Journal de Trading",
    18: "Module Final — Fin de formation"
};

/* ===========================
   AUTH
=========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Afficher lien admin si nécessaire
    const adminLink = document.getElementById("admin-link");
    if (user.email === ADMIN_EMAIL && adminLink) {
        adminLink.style.display = "flex";
    }

    try {

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error("Utilisateur introuvable");
            return;
        }

        const data = userSnap.data();

        /* --- Nom --- */
        const nameEl = document.getElementById("profile-name");
        if (nameEl) nameEl.innerHTML = data.username || data.name || "Étudiant Nathan Trading";

        /* --- Email --- */
        const emailEl = document.getElementById("profile-email");
        if (emailEl) emailEl.innerHTML = user.email;

        /* --- UID --- */
        const uidEl = document.getElementById("profile-uid");
        if (uidEl) uidEl.innerHTML = user.uid;

        /* --- Statut premium --- */
        const premiumEl = document.getElementById("profile-premium");
        if (premiumEl) {
            premiumEl.innerHTML = data.premium
                ? "<span style='color:#ffd700;font-weight:700;'>⭐ Premium Actif</span>"
                : "<span style='color:#bbb;'>Compte Standard</span>";
        }

        /* --- Progression --- */
        const modulesTermines = data.modulesTermines || [];
        const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);

        const progressEl = document.getElementById("profile-progress");
        if (progressEl) progressEl.innerHTML = `${progression}%`;

        const progressFill = document.getElementById("profile-progress-fill");
        if (progressFill) {
            progressFill.style.width = `${progression}%`;
            progressFill.innerHTML = `${progression}%`;
        }

        /* --- Date inscription --- */
        const createdEl = document.getElementById("profile-created");
        if (createdEl) {
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                createdEl.innerHTML = date.toLocaleDateString("fr-FR");
            } else {
                createdEl.innerHTML = "Non disponible";
            }
        }

        /* --- Modules terminés --- */
        const modulesSection = document.getElementById("profile-modules");
        if (modulesSection) {
            if (modulesTermines.length === 0) {
                modulesSection.innerHTML = "<p style='color:#bbb;'>Aucun module terminé pour l'instant.</p>";
            } else {
                const liste = modulesTermines
                    .sort((a, b) => a - b)
                    .map(id => `
                        <div style="
                            display:flex;
                            align-items:center;
                            gap:10px;
                            padding:10px 15px;
                            background:#1a1a1a;
                            border-radius:10px;
                            margin-bottom:8px;
                            font-size:14px;
                        ">
                            <span style="color:#00ffae;font-size:16px;">✅</span>
                            <span>${nomsModules[id] || "Module " + id}</span>
                        </div>
                    `)
                    .join("");
                modulesSection.innerHTML = liste;
            }
        }

    } catch (error) {
        console.error("Erreur Firestore :", error);
    }
});

/* ===========================
   DÉCONNEXION
=========================== */

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