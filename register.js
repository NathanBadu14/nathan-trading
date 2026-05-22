import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🔥 register.js chargé");

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

/* =========================
   INSCRIPTION
========================= */
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-password-confirm").value;

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // 1. Création du compte utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Compte Firebase créé pour :", user.email);

      // 2. Enregistrement des données dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: user.email,
        uid: user.uid,
        premium: false,
        progression: 0,
        completedModules: [],
        createdAt: new Date()
      });
      console.log("✅ Données enregistrées dans Firestore");

      // 3. Envoi de l'email de vérification (Isolé pour capturer les erreurs SMTP)
      try {
        await sendEmailVerification(user);
        console.log("📧 Email de vérification envoyé avec succès !");
        alert("Compte créé avec succès 🔥 Un e-mail de vérification vous a été envoyé à l'adresse " + user.email + ". Veuillez valider votre boîte de réception avant de vous connecter.");
      } catch (mailError) {
        console.error("❌ Erreur critique lors de l'envoi du mail (SMTP) :", mailError);
        alert("Compte créé avec succès ! Cependant, l'e-mail de vérification n'a pas pu être envoyé par le serveur SMTP. Vous pouvez tout de même essayer de vous connecter.");
      }

      // Redirection automatique vers la page de connexion
      window.location.href = "connexion.html";

    } catch (error) {
      console.error("❌ Erreur lors de l'inscription générale :", error);
      
      // Messages d'erreurs Firebase clairs pour l'utilisateur
      if (error.code === "auth/email-already-in-use") {
        alert("Cet e-mail est déjà associé à un compte.");
      } else if (error.code === "auth/weak-password") {
        alert("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        alert(error.message);
      }
    }
  });
}

/* =========================
   GESTION DES MOTS DE PASSE VISIBLES
========================= */

// 1. Pour le premier champ Mot de passe
const toggleRegisterPassword = document.getElementById("toggle-register-password");
const registerPasswordInput = document.getElementById("register-password");

if (toggleRegisterPassword && registerPasswordInput) {
  toggleRegisterPassword.addEventListener("click", () => {
    if (registerPasswordInput.type === "password") {
      registerPasswordInput.type = "text";
      toggleRegisterPassword.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      registerPasswordInput.type = "password";
      toggleRegisterPassword.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}

// 2. Pour le champ de Confirmation du mot de passe
const toggleConfirmPassword = document.getElementById("toggle-register-password-confirm");
const confirmPasswordInput = document.getElementById("register-password-confirm");

if (toggleConfirmPassword && confirmPasswordInput) {
  toggleConfirmPassword.addEventListener("click", () => {
    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      toggleConfirmPassword.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      confirmPasswordInput.type = "password";
      toggleConfirmPassword.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}