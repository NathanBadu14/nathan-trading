import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
  authDomain: "nathan-trading.firebaseapp.com",
  projectId: "nathan-trading",
  storageBucket: "nathan-trading.firebasestorage.app",
  messagingSenderId: "908084098772",
  appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
};

/* =========================
   INITIALISATION
========================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Videos page connectée");

/* =========================
   PROTECTION PAGE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Utilisateur introuvable");
      window.location.href = "index.html";
      return;
    }

    const userData = userSnap.data();

    /* =========================
       PRENOM / BIENVENUE
    ========================= */
    const studentEmail = document.querySelector(".student-email");
    if (studentEmail) {
      studentEmail.innerHTML = `Bienvenue ${userData.username || "Trader"} 🔥`; // Correction de userData.name en userData.username pour correspondre à ton admin.js
    }

    /* =========================
       ADMIN
    ========================= */
    const adminLink = document.getElementById("admin-link");
    const ADMIN_EMAIL = "badumisanathan807@gmail.com";

    if (adminLink) {
      adminLink.style.display = user.email === ADMIN_EMAIL ? "flex" : "none";
    }

    /* =========================
       PREMIUM
    ========================= */
    if (!userData.premium) {
      alert("Accès réservé aux élèves Premium.");
      window.location.href = "payment.html";
      return;
    }

    /* =========================
       DEBLOCAGE DYNAMIQUE DES MODULES
    ========================= */
    // Par défaut, l'utilisateur commence au module index 1 (deuxième carte débloquée, la première étant l'intro à l'index 0).
    const currentModuleIndex = userData.currentModuleIndex !== undefined ? userData.currentModuleIndex : 1;
    const modules = document.querySelectorAll(".video-card");
    const totalModules = modules.length;

    modules.forEach((module, index) => {
      // Débloque tous les modules jusqu'à l'index courant de l'utilisateur
      if (index <= currentModuleIndex) {
        module.classList.remove("locked");
        module.classList.add("unlocked");
        
        // Supprime l'overlay de verrouillage s'il existe pour ce module
        const overlay = module.querySelector(".locked-overlay");
        if (overlay) overlay.style.display = "none";
        
        // Active le bouton de complétion et l'iframe
        const btn = module.querySelector(".complete-btn");
        if (btn) {
          btn.removeAttribute("disabled");
          btn.style.backgroundColor = ""; // Reset couleur du bouton verrouillé
          btn.style.cursor = "pointer";
        }
        const iframe = module.querySelector("iframe");
        if (iframe) iframe.style.display = "block";

        const statusSpan = module.querySelector(".module-status");
        if (statusSpan && statusSpan.classList.contains("locked-status")) {
          statusSpan.classList.remove("locked-status");
          statusSpan.classList.add("completed");
          statusSpan.innerHTML = "Disponible";
        }
      } else {
        module.classList.remove("unlocked");
        module.classList.add("locked");
      }
    });

    /* =========================
       MISE À JOUR DE LA BARRE DE PROGRESSION VISUELLE
    ========================= */
    const progressText = document.getElementById("progress-text");
    const progressFill = document.getElementById("progress-fill");
    const currentProgression = userData.progression || 0;

    if (progressText) progressText.innerText = `${currentProgression}% terminé`;
    if (progressFill) {
      progressFill.style.width = `${currentProgression}%`;
      progressFill.innerText = `${currentProgression}%`;
    }

    /* =========================
       BOUTONS TERMINER
    ========================= */
    const completeButtons = document.querySelectorAll(".complete-btn");

    completeButtons.forEach((button, index) => {
      button.addEventListener("click", async () => {
        // L'index du bouton correspond exactement à l'index du module en cours de validation
        const nextModuleIndex = index + 1;

        // Calcul précis basé sur le nombre total réel de tes cartes (20 modules)
        let progression = Math.round((nextModuleIndex / totalModules) * 100);
        if (progression > 100) progression = 100;

        try {
          await updateDoc(userRef, {
            currentModuleIndex: nextModuleIndex,
            progression: progression
          });

          alert(`Module validé ✅\nProgression : ${progression}%`);
          location.reload();
        } catch (error) {
          console.error(error);
          alert("Erreur lors de la mise à jour de la progression");
        }
      });
    });

    /* =========================
       GESTION DES COMMENTAIRES
    ========================= */
    const commentForms = document.querySelectorAll(".comment-form");

    commentForms.forEach((form, index) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector(".comment-input");
        const message = input.value.trim();

        if (!message) return;

        try {
          await addDoc(collection(db, "comments"), {
            videoId: index,
            email: user.email,
            name: userData.username || "Trader",
            message: message,
            createdAt: new Date()
          });

          input.value = "";
          loadComments();
        } catch (error) {
          console.error(error);
        }
      });
    });

    /* =========================
       CHARGEMENT DES COMMENTAIRES
    ========================= */
    async function loadComments() {
      const containers = document.querySelectorAll(".comments-container");
      containers.forEach(container => container.innerHTML = "");

      const commentsQuery = query(
        collection(db, "comments"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(commentsQuery);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const container = containers[data.videoId];

        if (!container) return;

        container.innerHTML += `
          <div class="comment-card">
            <h4>${data.name || data.email}</h4>
            <p>${data.message}</p>
          </div>
        `;
      });
    }

    loadComments();

  } catch (error) {
    console.error(error);
    alert("Erreur lors du chargement des vidéos");
  }
});

/* =========================
   DECONNEXION
========================= */
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
    }
  });
}