import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;

    const adminLink = document.getElementById("admin-link");
    if (user.email === ADMIN_EMAIL && adminLink) {
        adminLink.style.display = "flex";
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

/* --- Formulaire support --- */
const supportForm = document.getElementById("support-form");
const submitBtn = supportForm ? supportForm.querySelector("button[type='submit']") : null;
const successMsg = document.getElementById("support-success");

if (supportForm) {
    supportForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Vous devez être connecté.");
            return;
        }

        const messageEl = document.getElementById("support-message");
        const message = messageEl ? messageEl.value.trim() : "";

        if (!message) {
            alert("Veuillez écrire un message.");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Envoi en cours...";
        }

        try {
            await addDoc(collection(db, "supports"), {
                email: currentUser.email,
                uid: currentUser.uid,
                message: message,
                createdAt: new Date(),
                lu: false
            });

            // Confirmation visuelle sans alert
            if (submitBtn) {
                submitBtn.innerHTML = "✅ Message envoyé !";
                submitBtn.style.background = "#00ffae";
                submitBtn.style.color = "#000";
            }

            if (successMsg) successMsg.style.display = "block";
            supportForm.reset();

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = "Envoyer le message";
                    submitBtn.style.background = "";
                    submitBtn.style.color = "";
                }
                if (successMsg) successMsg.style.display = "none";
            }, 4000);

        } catch (error) {
            console.error("Erreur support :", error);
            alert("Erreur lors de l'envoi. Réessayez.");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Envoyer le message";
            }
        }
    });
}