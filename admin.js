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
    setDoc
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

// Cache global des utilisateurs pour l'export CSV
let tousLesUtilisateurs = [];

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
            if (!message) { alert("Écris une annonce"); return; }

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
                card.style.display = card.innerText.toLowerCase().includes(terme) ? "block" : "none";
            });
        });
    }

    /* =========================
       EXPORT CSV
    ========================= */
    const exportBtn = document.getElementById("export-csv");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => exporterCSV());
    }

    /* =========================
       EMAIL GROUPÉ
    ========================= */
    const emailBtn = document.getElementById("email-tous");
    if (emailBtn) {
        emailBtn.addEventListener("click", () => {
            const emails = tousLesUtilisateurs
                .map(u => u.email)
                .filter(Boolean)
                .join(",");
            if (!emails) { alert("Aucun email trouvé."); return; }
            window.open(`mailto:?bcc=${emails}&subject=Nathan Trading Academy&body=Bonjour,%0A%0A`, "_blank");
        });
    }

    await chargerUtilisateurs();
});

/* =========================
   CHARGEMENT UTILISATEURS
========================= */
async function chargerUtilisateurs() {

    const usersContainer = document.getElementById("admin-users");
    if (usersContainer) usersContainer.innerHTML = "<p>Chargement...</p>";

    try {
        const snapshot = await getDocs(collection(db, "users"));

        let totalUsers = 0;
        let premiumUsers = 0;
        let totalProgression = 0;
        const cartes = [];
        tousLesUtilisateurs = [];

        snapshot.forEach((docElement) => {
            const data = docElement.data();
            const userId = docElement.id;

            totalUsers++;
            if (data.premium) premiumUsers++;

            const modulesTermines = data.modulesTermines || [];
            const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);
            totalProgression += progression;

            const isPremium = data.premium || false;

            // Cache pour CSV
            tousLesUtilisateurs.push({
                id: userId,
                nom: data.username || "Sans nom",
                email: data.email || "",
                premium: isPremium,
                progression: progression,
                modulesTermines: modulesTermines
            });

            // Liste des modules terminés
            const listeModules = modulesTermines.length > 0
                ? modulesTermines
                    .sort((a, b) => a - b)
                    .map(id => `<li style="margin-bottom:4px;">✅ ${nomsModules[id] || "Module " + id}</li>`)
                    .join("")
                : "<li style='color:#bbb;'>Aucun module terminé</li>";

            cartes.push(`
                <div class="admin-card" data-id="${userId}">
                    <h3>${data.username || "Sans nom"}</h3>
                    <p><i class="fa-solid fa-envelope"></i> ${data.email || "Pas d'email"}</p>
                    <p><i class="fa-solid fa-chart-line"></i> Progression : <strong>${progression}%</strong> (${modulesTermines.length}/${TOTAL_MODULES} modules)</p>
                    <p><i class="fa-solid fa-crown"></i> Statut : <strong>${isPremium ? "⭐ Premium" : "Gratuit"}</strong></p>

                    <!-- Détails modules (masqués par défaut) -->
                    <div class="modules-detail" id="modules-${userId}" style="display:none;margin:15px 0;background:#1a1a1a;padding:15px;border-radius:12px;">
                        <p style="font-weight:600;margin-bottom:10px;color:#00c8ff;">Modules terminés :</p>
                        <ul style="list-style:none;padding:0;font-size:13px;">
                            ${listeModules}
                        </ul>
                    </div>

                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">
                        <button class="voir-modules-btn" data-id="${userId}" style="padding:10px 16px;border:1px solid #00c8ff;background:transparent;color:#00c8ff;border-radius:10px;cursor:pointer;font-size:13px;">
                            📋 Voir modules
                        </button>
                        <button class="premium-btn" data-id="${userId}" data-premium="${isPremium}" style="padding:10px 16px;border:none;background:#00c8ff;color:#000;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;">
                            ${isPremium ? "❌ Retirer Premium" : "⭐ Activer Premium"}
                        </button>
                        <button class="delete-user-btn" data-id="${userId}" style="padding:10px 16px;border:none;background:#ff3b3b;color:#fff;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `);
        });

        /* Stats */
        const elTotal = document.getElementById("total-users");
        const elPremium = document.getElementById("premium-users");
        const elProgress = document.getElementById("average-progress");

        if (elTotal) elTotal.innerText = totalUsers;
        if (elPremium) elPremium.innerText = premiumUsers;
        if (elProgress) elProgress.innerText = `${totalUsers > 0 ? Math.round(totalProgression / totalUsers) : 0}%`;

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
   CLICS DÉLÉGUÉS
========================= */
document.addEventListener("click", async (e) => {

    /* --- VOIR MODULES --- */
    if (e.target.matches(".voir-modules-btn")) {
        const userId = e.target.getAttribute("data-id");
        const detail = document.getElementById(`modules-${userId}`);
        if (detail) {
            const visible = detail.style.display !== "none";
            detail.style.display = visible ? "none" : "block";
            e.target.innerText = visible ? "📋 Voir modules" : "🔼 Masquer";
        }
    }

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

            const card = btn.closest(".admin-card");
            if (card) {
                const statutEl = card.querySelector("p:nth-child(4) strong");
                if (statutEl) statutEl.innerText = newStatus ? "⭐ Premium" : "Gratuit";
            }

            // Mettre à jour le cache
            const u = tousLesUtilisateurs.find(u => u.id === userId);
            if (u) u.premium = newStatus;

            await chargerStats();
            alert(`Statut premium ${newStatus ? "activé" : "retiré"} ✅`);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la modification du statut.");
        }
    }

    /* --- SUPPRIMER --- */
    if (e.target.matches(".delete-user-btn")) {
        const userId = e.target.getAttribute("data-id");
        if (!confirm("Supprimer cet utilisateur définitivement ?")) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            e.target.closest(".admin-card").remove();
            tousLesUtilisateurs = tousLesUtilisateurs.filter(u => u.id !== userId);
            await chargerStats();
            alert("Utilisateur supprimé ✅");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression.");
        }
    }
});

/* =========================
   EXPORT CSV
========================= */
function exporterCSV() {
    if (tousLesUtilisateurs.length === 0) {
        alert("Aucun utilisateur à exporter.");
        return;
    }

    const entetes = ["Nom", "Email", "Premium", "Progression (%)", "Modules terminés", "Nombre modules"];

    const lignes = tousLesUtilisateurs.map(u => {
        const modulesNoms = u.modulesTermines
            .sort((a, b) => a - b)
            .map(id => nomsModules[id] || "Module " + id)
            .join(" | ");

        return [
            `"${u.nom}"`,
            `"${u.email}"`,
            u.premium ? "Oui" : "Non",
            u.progression,
            `"${modulesNoms}"`,
            u.modulesTermines.length
        ].join(",");
    });

    const csv = [entetes.join(","), ...lignes].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `eleves_nathan_trading_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
}

/* =========================
   RECALCUL STATS
========================= */
async function chargerStats() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        let total = 0, premium = 0, progression = 0;

        snapshot.forEach(d => {
            const data = d.data();
            total++;
            if (data.premium) premium++;
            const modules = data.modulesTermines || [];
            progression += Math.round((modules.length / TOTAL_MODULES) * 100);
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