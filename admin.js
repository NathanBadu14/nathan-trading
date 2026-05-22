import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut // Ajout de signOut qui manquait dans tes imports
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
           TRAITEMENT DES DONNÉES & AFFICHAGE
        ========================= */
        querySnapshot.forEach((docElement) => {
            const data = docElement.data();
            const userId = docElement.id; // On récupère l'identifiant Firestore unique de l'utilisateur
            
            totalUsers++;

            if (data.premium) {
                premiumUsers++;
            }

            totalProgression += data.progression || 0;

            /* =========================
               INJECTION DES CARTES DANS LE HTML
            ========================= */
            if (usersContainer) {
                const isPremium = data.premium || false;
                
                // On crée une structure propre pour chaque utilisateur
                const userCard = document.createElement("div");
                userCard.className = "user-card";
                userCard.innerHTML = `
                    <div class="user-info">
                        <p><strong>Nom :</strong> ${data.username || "Sans nom"}</p>
                        <p><strong>Email :</strong> ${data.email || "Pas d'email"}</p>
                        <p><strong>Progression :</strong> ${data.progression || 0}%</p>
                    </div>
                    <div class="user-actions">
                        <button 
                            class="premium-btn" 
                            data-id="${userId}" 
                            data-premium="${isPremium}">
                            ${isPremium ? "❌ Retirer Premium" : "⭐ Activer Premium"}
                        </button>
                    </div>
                `;
                usersContainer.appendChild(userCard);
            }
        });

        /* =========================
           AFFICHAGE DES STATS
        ========================= */
        console.log(`Total: ${totalUsers}, Premium: ${premiumUsers}, Progression Globale: ${totalProgression}`);
        
        // Liens avec ton interface (si tu as ces IDs dans ton HTML)
        if (document.getElementById("total-users-count")) {
            document.getElementById("total-users-count").innerText = totalUsers;
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
});

/* =========================
   GESTION DU CLIC SUR LE BOUTON PREMIUM (DÉLÉGATION)
========================= */
document.addEventListener("click", async (e) => {
    // Si l'élément cliqué possède la classe "premium-btn"
    if (e.target.matches(".premium-btn")) {
        const button = e.target;
        const userId = button.getAttribute("data-id");
        
        // Attention : la valeur d'un attribut est toujours une String, on la convertit en Boolean
        const currentPremiumStatus = button.getAttribute("data-premium") === "true";
        
        // On inverse le statut
        const newPremiumStatus = !currentPremiumStatus;

        try {
            // Mise à jour dans Firebase Firestore
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                premium: newPremiumStatus
            });

            // Mise à jour visuelle immédiate du bouton
            button.setAttribute("data-premium", newPremiumStatus);
            button.innerHTML = newPremiumStatus ? "❌ Retirer Premium" : "⭐ Activer Premium";
            
            alert(`Statut premium modifié avec succès !`);
            
            // Astuce : pour mettre à jour les statistiques de la page sans recharger, 
            // tu peux simplement exécuter un rafraîchissement ou laisser l'admin gérer.
        } catch (error) {
            console.error("Erreur Firestore lors du changement de statut premium :", error);
            alert("Impossible de modifier le statut premium.");
        }
    }
});