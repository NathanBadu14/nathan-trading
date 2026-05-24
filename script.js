import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

console.log("🚀 Script d'accueil (script.js) chargé avec succès !");

/* =========================
   CONFIG FIREBASE
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
  authDomain: "nathan-trading.firebaseapp.com",
  projectId: "nathan-trading",
  storageBucket: "nathan-trading.firebasestorage.app",
  messagingSenderId: "908084098772",
  appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
};

/* =========================
   INITIALISATION
========================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔥 Firebase connecté sur l'accueil");

/* =========================
   SESSION UTILISATEUR (ACCUEIL)
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Élève en ligne :", user.email);
    // Optionnel : Tu pourrais ici modifier le bouton "Connexion" en "Mon Espace" si l'utilisateur est déjà connecté
  } else {
    console.log("❌ Aucun élève connecté actuellement");
  }
});

/* =========================
   INTERACTION FAQ (ACCORDEON)
========================= */
const faqItems = document.querySelectorAll(".faq-item");

if (faqItems.length > 0) {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    
    if (question) {
      question.addEventListener("click", () => {
        // Ferme les autres questions ouvertes (optionnel, pour un effet plus propre)
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
          }
        });
        
        // Alterne l'état de la question cliquée
        item.classList.toggle("active");
      });
    }
  });
}

const menuBtn =
document.querySelector(
".mobile-menu-btn"
);

const navLinks =
document.querySelector(
".nav-links"
);

menuBtn.addEventListener(
"click",
()=>{

navLinks.classList.toggle(
"active"
);

});