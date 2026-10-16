import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    auth, afficherMessage, masquerMessage, chargement, messageErreur,
    assurerProfil, continuerAvecGoogle, brancherOeil, redirigerSiConnecte
} from "./auth-common.js";

redirigerSiConnecte();
brancherOeil("toggle-login-password", "login-password");

/* Pré-remplit l'email si on arrive depuis l'inscription */
const emailInput = document.getElementById("login-email");
const emailUrl = new URLSearchParams(window.location.search).get("email");
if (emailUrl && emailInput) emailInput.value = emailUrl;

/* Connexion par email */
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        masquerMessage();
        const bouton = loginForm.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();
        const password = document.getElementById("login-password").value;

        window.__authEnCours = true;
        chargement(bouton, true, "Connexion...");
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await assurerProfil(cred.user);
            window.location.href = "dashboard.html";
        } catch (error) {
            window.__authEnCours = false;
            console.error(error.code);
            afficherMessage(messageErreur(error));
            chargement(bouton, false);
        }
    });
}

/* Mot de passe oublié : utilise l'email déjà saisi, sans fenêtre popup */
const resetBtn = document.getElementById("reset-password");
if (resetBtn) {
    resetBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        masquerMessage();
        const email = emailInput.value.trim();
        if (!email) {
            afficherMessage("Saisis d'abord ton adresse email, puis clique sur « Mot de passe oublié ».");
            emailInput.focus();
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            afficherMessage("Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé. Pense à vérifier tes spams.", "ok");
        } catch (error) {
            console.error(error.code);
            afficherMessage(messageErreur(error));
        }
    });
}

/* Connexion Google */
const googleBtn = document.getElementById("google-login");
if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
        masquerMessage();
        window.__authEnCours = true;
        chargement(googleBtn, true, "Ouverture de Google...");
        try {
            const nouveau = await continuerAvecGoogle();
            window.location.href = nouveau ? "payment.html" : "dashboard.html";
        } catch (error) {
            window.__authEnCours = false;
            console.error(error.code);
            afficherMessage(messageErreur(error));
            chargement(googleBtn, false);
        }
    });
}
