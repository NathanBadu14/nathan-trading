import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIGURATION
========================= */
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

/* =========================
   ADMIN CONFIGURATION
========================= */
const ADMIN_EMAIL = "badumisanathan807@gmail.com";

/* =========================
   PROTECTION & GESTION ADMIN
========================= */
onAuthStateChanged(auth, async (user) => {
    // Si l'utilisateur n'est pas connecté
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    /* =========================
       VÉRIFICATION DROITS ADMIN
    ========================= */
    if (user.email !== ADMIN_EMAIL) {
        alert("⛔ Accès refusé");
        window.location.href = "dashboard.html";
        return;
    }

    /* =========================
       AFFICHER LIEN ADMIN
    ========================= */
    const adminLink = document.getElementById("admin-link");
    if (adminLink) {
        adminLink.style.display = "flex";
    }

    /* =========================
       DECONNEXION
    ========================= */
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            window.location.href = "index.html";
        });
    }

    /* =========================
       PUBLICATION ANNONCE
    ========================= */
    const publishBtn = document.getElementById("publish-announcement");
    if (publishBtn) {
        publishBtn.addEventListener("click", async () => {
            const announcementInput = document.getElementById("announcement-input");
            const announcement = announcementInput ? announcementInput.value : "";

            if (announcement.trim() === "") {
                alert("Écris une annonce");
                return;
            }

            try {
                await setDoc(doc(db, "announcements", "latest"), {
                    message: announcement,
                    createdAt: new Date()
                });
                alert("Annonce publiée 🔥");
                if (announcementInput) announcementInput.value = "";
            } catch (error) {
                console.error(error);
                alert("Erreur publication");
            }
        });
    }

    /* =========================
       RÉCUPÉRATION USERS & STATS
    ========================= */
    const usersContainer = document.getElementById("admin-users");
    if (usersContainer) {
        usersContainer.innerHTML = "";
    }

    try {
        const querySnapshot = await getDocs(collection(db, "users"));

        /* =========================
           VARIABLES STATS
        ========================= */
        let totalUsers = 0;
        let premiumUsers = 0;
        let totalProgression = 0;

        /* =========================
           TRAITEMENT DES DONNÉES
        ========================= */
        querySnapshot.forEach((docElement) => {
            const data = docElement.data();
            totalUsers++;

            if (data.premium) {
                premiumUsers++;
            }

            // Correction de la ligne 226 : On récupère le champ 'progression' du document (par défaut 0 si absent)
            totalProgression += data.progression || 0;

            // Optionnel : Tu pourras injecter ton HTML pour lister les utilisateurs ici plus tard
        });

        /* =========================
           AFFICHAGE DES STATS (Exemple)
        ========================= */
        console.log(`Total: ${totalUsers}, Premium: ${premiumUsers}, Progression Globale: ${totalProgression}`);
        
        // Si tu as des éléments HTML pour afficher tes compteurs, tu peux les lier ici :
        // document.getElementById("total-users-count").innerText = totalUsers;

    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
});