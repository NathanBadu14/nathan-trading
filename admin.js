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
   FIREBASE
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

const ADMIN_EMAIL = "badumisanathan807@gmail.com";

/* =========================
   AUTH & PROTECTION
========================= */
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        alert("⛔ Accès refusé");
        window.location.href = "dashboard.html";
        return;
    }

    const adminLink = document.getElementById("admin-link");
    if (adminLink) adminLink.style.display = "flex";

    /* =========================
       DÉCONNEXION
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
            const input = document.getElementById("announcement-input");
            const message = input ? input.value.trim() : "";

            if (!message) {
                alert("Écris une annonce");
                return;
            }

            try {
                await setDoc(doc(db, "announcements", "latest"), {
                    message: message,
                    createdAt: new Date()
                });
                alert("Annonce publiée 🔥");
                if (input) input.value = "";
            } catch (error) {
                console.error(error);
                alert("Erreur publication");
            }
        });
    }

    /* =========================
       RECHERCHE
    ========================= */
    const searchInput = document.getElementById("search-user");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const terme = searchInput.value.toLowerCase();
            document.querySelectorAll(".admin-card").forEach(card => {
                const texte = card.innerText.toLowerCase();
                card.style.display = texte.includes(terme) ? "block" : "none";
            });
        });
    }

    /* =========================
       CHARGEMENT USERS & STATS
    ========================= */
    await chargerUtilisateurs();
});

async function chargerUtilisateurs() {

    const usersContainer = document.getElementById("admin-users");
    if (usersContainer) usersContainer.innerHTML = "<p>Chargement...</p>";

    try {
        const snapshot = await getDocs(collection(db, "users"));

        let totalUsers = 0;
        let premiumUsers = 0;
        let totalProgression = 0;

        const cartes = [];

        snapshot.forEach((docElement) => {
            const data = docElement.data();
            const userId = docElement.id;

            totalUsers++;
            if (data.premium) premiumUsers++;
            totalProgression += data.progression || 0;

            const isPremium = data.premium || false;
            const progression = data.progression || 0;

            cartes.push(`
                <div class="admin-card">
                    <h3>${data.username || "Sans nom"}</h3>
                    <p><i class="fa-solid fa-envelope"></i> ${data.email || "Pas d'email"}</p>
                    <p><i class="fa-solid fa-chart-line"></i> Progression : <strong>${progression}%</strong></p>
                    <p><i class="fa-solid fa-crown"></i> Statut : <strong>${isPremium ? "⭐ Premium" : "Gratuit"}</strong></p>
                    <button
                        class="premium-btn"
                        data-id="${userId}"
                        data-premium="${isPremium}">
                        ${isPremium ? "❌ Retirer Premium" : "⭐ Activer Premium"}
                    </button>
                    <button
                        class="delete-user-btn"
                        data-id="${userId}">
                        🗑️ Supprimer
                    </button>
                </div>
            `);
        });

        /* =========================
           AFFICHAGE STATS — IDs corrects
        ========================= */
        const elTotal = document.getElementById("total-users");
        const elPremium = document.getElementById("premium-users");
        const elProgress = document.getElementById("average-progress");

        if (elTotal) elTotal.innerText = totalUsers;
        if (elPremium) elPremium.innerText = premiumUsers;
        if (elProgress) {
            const moyenne = totalUsers > 0
                ? Math.round(totalProgression / totalUsers)
                : 0;
            elProgress.innerText = `${moyenne}%`;
        }

        /* =========================
           AFFICHAGE CARTES
        ========================= */
        if (usersContainer) {
            usersContainer.innerHTML = cartes.length > 0
                ? cartes.join("")
                : "<p>Aucun utilisateur trouvé.</p>";
        }

    } catch (error) {
        console.error("Erreur chargement users :", error);
        const usersContainer = document.getElementById("admin-users");
        if (usersContainer) usersContainer.innerHTML = "<p>Erreur de chargement.</p>";
    }
}

/* =========================
   CLICS DÉLÉGUÉS (Premium + Supprimer)
========================= */
document.addEventListener("click", async (e) => {

    /* --- TOGGLE PREMIUM --- */
    if (e.target.matches(".premium-btn")) {
        const btn = e.target;
        const userId = btn.getAttribute("data-id");
        const currentStatus = btn.getAttribute("data-premium") === "true";
        const newStatus = !currentStatus;

        try {
            await updateDoc(doc(db, "users", userId), { premium: newStatus });
            btn.setAttribute("data-premium", newStatus);
            btn.innerHTML = newStatus ? "❌ Retirer Premium" : "⭐ Activer Premium";

            // Met à jour le statut visible sur la carte
            const card = btn.closest(".admin-card");
            if (card) {
                const statutEl = card.querySelector("p:nth-child(4) strong");
                if (statutEl) statutEl.innerText = newStatus ? "⭐ Premium" : "Gratuit";
            }

            // Recalcule les stats
            await chargerStats();

            alert(`Statut premium ${newStatus ? "activé" : "retiré"} ✅`);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la modification du statut.");
        }
    }

    /* --- SUPPRIMER UTILISATEUR --- */
    if (e.target.matches(".delete-user-btn")) {
        const userId = e.target.getAttribute("data-id");
        if (!confirm("Supprimer cet utilisateur définitivement ?")) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            e.target.closest(".admin-card").remove();
            await chargerStats();
            alert("Utilisateur supprimé ✅");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression.");
        }
    }
});

/* =========================
   RECALCUL STATS SEUL
========================= */
async function chargerStats() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        let total = 0, premium = 0, progression = 0;

        snapshot.forEach(d => {
            const data = d.data();
            total++;
            if (data.premium) premium++;
            progression += data.progression || 0;
        });

        const elTotal = document.getElementById("total-users");
        const elPremium = document.getElementById("premium-users");
        const elProgress = document.getElementById("average-progress");

        if (elTotal) elTotal.innerText = total;
        if (elPremium) elPremium.innerText = premium;
        if (elProgress) elProgress.innerText = `${total > 0 ? Math.round(progression / total) : 0}%`;

    } catch (error) {
        console.error("Erreur stats :", error);
    }
}