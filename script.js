import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

console.log("🚀 Script chargé avec succès par le navigateur !");

const firebaseConfig = {
  apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
  authDomain: "nathan-trading.firebaseapp.com",
  projectId: "nathan-trading",
  storageBucket: "nathan-trading.firebasestorage.app",
  messagingSenderId: "90808409872",
  appId: "1:90808409872:web:c99392d2e52a10f1e7ed41"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔥 Nathan Trading - Firebase est connecté et prêt !");

// --- GESTION DE L'INSCRIPTION ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
    console.log("✅ Formulaire d'inscription détecté.");
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Bloque le rechargement de la page
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        console.log("Formulaire d'inscription soumis pour :", email);

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Utilisateur créé :", userCredential.user);
                alert("Félicitations ! Inscription réussie sur Nathan Trading.");
                registerForm.reset();
            })
            .catch((error) => {
                console.error("Erreur Firebase Inscription :", error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    alert("Cet e-mail est déjà utilisé pour un autre compte.");
                } else if (error.code === 'auth/weak-password') {
                    alert("Le mot de passe doit contenir au moins 6 caractères.");
                } else {
                    alert("Erreur : " + error.message);
                }
            });
    });
} else {
    console.error("❌ Impossible de trouver l'élément HTML avec l'ID 'register-form'");
}

// --- GESTION DE LA CONNEXION ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    console.log("✅ Formulaire de connexion détecté.");
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Bloque le rechargement de la page
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        console.log("Formulaire de connexion soumis pour :", email);

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Connexion réussie :", userCredential.user);
                alert("Bienvenue sur votre Dashboard Premium !");
            })
            .catch((error) => {
                console.error("Erreur Firebase Connexion :", error.code, error.message);
                alert("Identifiants incorrects ou compte introuvable.");
            });
    });
} else {
    console.error("❌ Impossible de trouver l'élément HTML avec l'ID 'login-form'");
}