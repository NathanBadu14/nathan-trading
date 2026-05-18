import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

console.log("Nathan Trading Premium Website Loaded & Auth Ready !");

// Ciblage par classe (le point "." devant signifie qu'on cherche une class)
const registerForm = document.querySelector('.register-form');

if (registerForm) {
    console.log("Formulaire d'inscription trouvé grâce à sa classe !");
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Bloque le rechargement de la page
        
        // Récupération des inputs par leurs classes
        const email = document.querySelector('.register-email').value;
        const password = document.querySelector('.register-password').value;

        console.log("Tentative d'envoi à Firebase pour :", email);

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Compte créé avec succès :", userCredential.user);
                alert("Félicitations ! Votre compte premium Nathan Trading a été créé.");
                registerForm.reset();
            })
            .catch((error) => {
                console.error("Erreur Firebase :", error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    alert("Cette adresse e-mail est déjà associée à un compte.");
                } else if (error.code === 'auth/weak-password') {
                    alert("Le mot de passe doit contenir au moins 6 caractères.");
                } else {
                    alert("Erreur : " + error.message);
                }
            });
    });
} else {
    console.error("Impossible de trouver l'élément avec la classe '.register-form' dans le HTML.");
}