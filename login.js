import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

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
      const user = userCredential.user;

      // 2. Vérification de l'email (DÉSACTIVÉE TEMPORAIREMENT POUR TES TESTS)
      /*
      if (!user.emailVerified) {
        alert("Veuillez vérifier votre email.");
        await auth.signOut(); 
        return;
      }
      */

      // 3. Redirection si tout est OK
      alert("Connexion réussie 🔥 Bienvenue sur Nathan Trading Academy !");
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error(error);
      alert("Email ou mot de passe incorrect.");
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
      alert("Un e-mail de réinitialisation vient de vous être envoyé.");
    } catch (error) {
      alert(error.message);
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
      await signInWithPopup(auth, provider);
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la connexion Google : " + error.message);
    }
  });
}