import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

const TOTAL_MODULES = 18;

/* ===========================
   VIDEOS PREMIUM
=========================== */

const premiumVideos = {
    1:  "https://iframe.mediadelivery.net/embed/682167/f4c635f5-ba3d-4281-9a06-9723eadeb1bb?autoplay=false&preload=false",
    2:  "https://iframe.mediadelivery.net/embed/682167/00260c83-1506-4715-bb86-8e8a8f7a5d05?autoplay=false&preload=false",
    3:  "https://iframe.mediadelivery.net/embed/682167/687d44ed-39cf-4fe2-b44f-a03b651aab31?autoplay=false&preload=false",
    4:  "https://iframe.mediadelivery.net/embed/682167/543411c3-dd5d-4c05-9a67-e2c61ac59cfd?autoplay=false&preload=false",
    5:  "https://iframe.mediadelivery.net/embed/682167/409f25ba-06f7-4680-9684-e7dc92e957d8?autoplay=false&preload=false",
    6:  "https://iframe.mediadelivery.net/embed/682167/c38276c8-4672-49f4-8a0a-e28456281506?autoplay=false&preload=false",
    7:  "https://iframe.mediadelivery.net/embed/682167/b8a9f640-95ba-4ccd-be8a-4eab50fc7879?autoplay=false&preload=false",
    8:  "https://iframe.mediadelivery.net/embed/682167/87684ed3-2df8-41fd-b7bf-e5d0cec96c21?autoplay=false&preload=false",
    9:  "https://iframe.mediadelivery.net/embed/682167/cb38cabd-b139-4581-9fe4-47d8d457f700?autoplay=false&preload=false",
    10: "https://iframe.mediadelivery.net/embed/682167/22e0264f-ac75-41c3-b30a-56b403dc97c1?autoplay=false&preload=false",
    11: "https://iframe.mediadelivery.net/embed/682167/f9d8e428-e0e2-4fbc-a8e7-c5c609ed9b91?autoplay=false&preload=false",
    12: "https://iframe.mediadelivery.net/embed/682167/9d3e39bb-e348-40a0-8ad9-5d2cb75a2d7c?autoplay=false&preload=false",
    13: "https://iframe.mediadelivery.net/embed/682167/60c08261-75dc-4e7b-af75-5dd6745c81ba?autoplay=false&preload=false",
    14: "https://iframe.mediadelivery.net/embed/682167/44011b7f-8893-487b-8082-747eef456a45?autoplay=false&preload=false",
    15: "https://iframe.mediadelivery.net/embed/682167/c5a278a0-d031-46d9-bbfe-7d0aea822a67?autoplay=false&preload=false",
    16: "https://iframe.mediadelivery.net/embed/682167/0188751b-c06a-45b4-abd8-047438abc376?autoplay=false&preload=false",
    17: "https://iframe.mediadelivery.net/embed/682167/ba7ac687-ac72-4506-8afd-66a0a6103831?autoplay=false&preload=false",
    18: "https://iframe.mediadelivery.net/embed/682167/d1b287c9-7e11-4540-8928-2e37077b352b?autoplay=false&preload=false"
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
                    allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen
                    style="width:100%;height:480px;border:none;border-radius:16px;background:#000;">
                </iframe>
            `;
        });

        /* ===========================
           MODULES — débloquer tout
        =========================== */

        const modules = document.querySelectorAll(".video-card");

        modules.forEach((module) => {
            const btn = module.querySelector(".complete-btn");
            const overlay = module.querySelector(".locked-overlay");
            const status = module.querySelector(".module-status");
            const video = module.querySelector(".video-container");

            module.classList.remove("locked");
            module.classList.add("unlocked");

            if (overlay) overlay.style.display = "none";
            if (video) { video.style.filter = "none"; video.style.pointerEvents = "auto"; }
            if (btn) { btn.disabled = false; btn.style.cursor = "pointer"; }
            if (status) { status.className = "module-status completed"; status.innerHTML = "Disponible"; }
        });

        /* ===========================
           PROGRESSION — affichage
        =========================== */

        const modulesTermines = userData.modulesTermines || [];
        const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);

        const progressText = document.getElementById("progress-text");
        const progressFill = document.getElementById("progress-fill");

        if (progressText) progressText.innerText = `${progression}% terminé`;
        if (progressFill) {
            progressFill.style.width = `${progression}%`;
            progressFill.innerText = `${progression}%`;
        }

        // Marquer visuellement les modules déjà terminés
        modules.forEach((module) => {
            const moduleId = parseInt(module.getAttribute("data-module"));
            const btn = module.querySelector(".complete-btn");
            if (modulesTermines.includes(moduleId)) {
                if (btn) {
                    btn.innerText = "✅ Terminé";
                    btn.style.backgroundColor = "#00ffae";
                    btn.style.color = "#000";
                }
            }
        });

        /* ===========================
           BOUTONS "MARQUER COMME TERMINÉ"
        =========================== */

        modules.forEach((module) => {
            const moduleId = parseInt(module.getAttribute("data-module"));
            const btn = module.querySelector(".complete-btn");

            if (!btn || modulesTermines.includes(moduleId)) return;

            btn.addEventListener("click", async () => {

                try {
                    const nouveauxModules = [...modulesTermines, moduleId];
                    const nouvelleProgression = Math.round((nouveauxModules.length / TOTAL_MODULES) * 100);

                    await updateDoc(userRef, {
                        modulesTermines: nouveauxModules,
                        progression: nouvelleProgression
                    });

                    // Mise à jour visuelle immédiate
                    btn.innerText = "✅ Terminé";
                    btn.style.backgroundColor = "#00ffae";
                    btn.style.color = "#000";
                    btn.disabled = true;

                    if (progressText) progressText.innerText = `${nouvelleProgression}% terminé`;
                    if (progressFill) {
                        progressFill.style.width = `${nouvelleProgression}%`;
                        progressFill.innerText = `${nouvelleProgression}%`;
                    }

                    modulesTermines.push(moduleId);

                } catch (error) {
                    console.error("Erreur progression :", error);
                    alert("Erreur lors de la sauvegarde.");
                }
            });
        });

        /* ===========================
           COMMENTAIRES
        =========================== */

        const commentForms = document.querySelectorAll(".comment-form");

        commentForms.forEach((form, index) => {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const input = form.querySelector(".comment-input");
                const message = input ? input.value.trim() : "";
                if (!message) return;

                try {
                    await addDoc(collection(db, "comments"), {
                        videoId: index,
                        email: user.email,
                        name: userData.username || "Trader",
                        message: message,
                        createdAt: new Date()
                    });
                    if (input) input.value = "";
                    await chargerCommentaires();
                } catch (error) {
                    console.error("Erreur commentaire :", error);
                }
            });
        });

        await chargerCommentaires();

    } catch (error) {
        console.error("Erreur videos.js :", error);
        alert("Erreur lors du chargement des vidéos.");
        window.location.replace("index.html");
    }
});

/* ===========================
   CHARGEMENT COMMENTAIRES
=========================== */

async function chargerCommentaires() {
    const containers = document.querySelectorAll(".comments-container");
    containers.forEach(c => c.innerHTML = "");

    try {
        const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

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
    } catch (error) {
        console.error("Erreur commentaires :", error);
    }
}