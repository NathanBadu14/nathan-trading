import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    auth, afficherMessage, masquerMessage, chargement, messageErreur,
    assurerProfil, continuerAvecGoogle, brancherOeil, redirigerSiConnecte
} from "./auth-common.js";

redirigerSiConnecte();
brancherOeil("toggle-register-password", "register-password");
brancherOeil("toggle-register-password-confirm", "register-password-confirm");

/* Indicateur de solidité du mot de passe */
const pwInput = document.getElementById("register-password");
const pwHint = document.getElementById("pw-strength");
if (pwInput && pwHint) {
    pwInput.addEventListener("input", () => {
        const v = pwInput.value;
        if (!v) { pwHint.textContent = ""; return; }
        let score = 0;
        if (v.length >= 8) score++;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        if (v.length < 6) { pwHint.textContent = "Trop court (6 caractères minimum)."; pwHint.style.color = "var(--red)"; }
        else if (score <= 1) { pwHint.textContent = "Faible : ajoute des chiffres et des majuscules."; pwHint.style.color = "var(--gold)"; }
        else if (score <= 2) { pwHint.textContent = "Correct."; pwHint.style.color = "var(--gold)"; }
        else { pwHint.textContent = "Solide."; pwHint.style.color = "var(--green)"; }
    });
}

/* Inscription par email */
const form = document.getElementById("register-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        masquerMessage();
        const bouton = form.querySelector('button[type="submit"]');
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirm = document.getElementById("register-password-confirm").value;

        if (!name) { afficherMessage("Saisis ton prénom."); return; }
        if (password !== confirm) { afficherMessage("Les mots de passe ne correspondent pas."); return; }

        window.__authEnCours = true;
        chargement(bouton, true, "Création du compte...");
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await assurerProfil(cred.user, name);

            // L'email de vérification n'est pas bloquant
            try { await sendEmailVerification(cred.user); } catch (mailError) { console.warn("Email de vérification :", mailError.code); }

            // Le compte est déjà connecté : on envoie l'élève vers l'étape suivante, le paiement
            window.location.href = "payment.html";
        } catch (error) {
            window.__authEnCours = false;
            console.error(error.code);
            afficherMessage(messageErreur(error));
            chargement(bouton, false);
        }
    });
}

/* Inscription avec Google */
const googleBtn = document.getElementById("google-register");
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
