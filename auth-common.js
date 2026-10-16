import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
    authDomain: "nathan-trading.firebaseapp.com",
    projectId: "nathan-trading",
    storageBucket: "nathan-trading.firebasestorage.app",
    messagingSenderId: "908084098772",
    appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* Message affiché dans la carte (remplace les alert) */
export function afficherMessage(texte, type = "err") {
    const el = document.getElementById("auth-msg");
    if (!el) return;
    el.textContent = texte;
    el.className = "form-msg " + type;
}

export function masquerMessage() {
    const el = document.getElementById("auth-msg");
    if (el) { el.textContent = ""; el.className = "form-msg"; }
}

/* Bouton en cours de chargement */
export function chargement(bouton, actif, texte) {
    if (!bouton) return;
    if (actif) {
        bouton.dataset.label = bouton.innerHTML;
        bouton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${texte || "Patiente..."}`;
        bouton.disabled = true;
    } else {
        if (bouton.dataset.label) bouton.innerHTML = bouton.dataset.label;
        bouton.disabled = false;
    }
}

export function messageErreur(error) {
    switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email ou mot de passe incorrect.";
        case "auth/invalid-email":
            return "Adresse email invalide.";
        case "auth/email-already-in-use":
            return "Cet email est déjà associé à un compte. Connecte-toi plutôt.";
        case "auth/weak-password":
            return "Mot de passe trop faible : 6 caractères minimum.";
        case "auth/too-many-requests":
            return "Trop de tentatives. Réessaie dans quelques minutes ou réinitialise ton mot de passe.";
        case "auth/network-request-failed":
            return "Problème de connexion internet. Réessaie.";
        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
            return "Connexion Google annulée.";
        case "auth/popup-blocked":
            return "Ton navigateur a bloqué la fenêtre Google. Autorise les popups et réessaie.";
        default:
            return "Une erreur est survenue. Réessaie ou contacte le support.";
    }
}

/* Crée le profil élève s'il n'existe pas encore (premier passage, Google inclus) */
export async function assurerProfil(user, prenomSaisi) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return false;

    const prenom = (prenomSaisi || (user.displayName || "").split(" ")[0] || "Trader").trim();
    await setDoc(ref, {
        username: prenom,
        name: prenom,
        email: user.email,
        uid: user.uid,
        premium: false,
        progression: 0,
        modulesTermines: [],
        createdAt: new Date()
    });
    return true;
}

/* Connexion / inscription avec Google : renvoie true si le compte vient d'être créé */
export async function continuerAvecGoogle() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return assurerProfil(result.user);
}

/* Œil pour afficher / masquer un mot de passe */
export function brancherOeil(idIcone, idChamp) {
    const icone = document.getElementById(idIcone);
    const champ = document.getElementById(idChamp);
    if (!icone || !champ) return;
    icone.setAttribute("tabindex", "0");
    const basculer = () => {
        const cache = champ.type === "password";
        champ.type = cache ? "text" : "password";
        icone.classList.toggle("fa-eye", !cache);
        icone.classList.toggle("fa-eye-slash", cache);
    };
    icone.addEventListener("click", basculer);
    icone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); basculer(); }
    });
}

/* Si l'élève est déjà connecté, on l'envoie directement dans son espace */
export function redirigerSiConnecte(destination = "dashboard.html") {
    onAuthStateChanged(auth, (user) => {
        if (user && !window.__authEnCours) window.location.href = destination;
    });
}
