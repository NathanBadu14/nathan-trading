import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🔥 login.js chargé");

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* Messages d'erreur lisibles */
function messageErreur(error) {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Email ou mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessaie dans quelques minutes ou réinitialise ton mot de passe.";
    case "auth/network-request-failed":
      return "Problème de connexion internet. Réessaie.";
    case "auth/popup-closed-by-user":
      return "Connexion Google annulée.";
    default:
      return "Connexion impossible. Réessaie ou contacte le support.";
  }
}

/* Crée le profil élève lors de la première connexion Google */
async function assurerProfil(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const prenom = (user.displayName || "").split(" ")[0] || "Trader";
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
}

/* =========================
   CONNEXION CLASSIQUE (EMAIL)
========================= */
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      // 1. Tentative de connexion
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await assurerProfil(userCredential.user);

      // 2. Redirection si tout est OK
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error(error.code, error.message);
      alert(messageErreur(error));
    }
  });
}

/* =========================
   GESTION DU MOT DE PASSE VISIBLE
========================= */
const togglePassword = document.getElementById("toggle-login-password");
const passwordInput = document.getElementById("login-password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      togglePassword.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}

/* =========================
   MOT DE PASSE OUBLIÉ
========================= */
const resetPasswordBtn = document.getElementById("reset-password");

if (resetPasswordBtn) {
  resetPasswordBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = prompt("Entrez votre adresse email pour recevoir le lien de réinitialisation :");
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé.");
    } catch (error) {
      console.error(error.code, error.message);
      alert(error.code === "auth/invalid-email" ? "Adresse email invalide." : "Impossible d'envoyer l'e-mail pour le moment. Réessaie.");
    }
  });
}

/* =========================
   CONNEXION GOOGLE
========================= */
const googleLoginBtn = document.getElementById("google-login");

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await assurerProfil(result.user);
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error.code, error.message);
      alert(messageErreur(error));
    }
  });
}