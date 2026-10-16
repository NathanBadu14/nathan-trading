import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   SESSION : adapter la navigation
========================= */
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("nav-login");
  const ctaBtn = document.getElementById("nav-cta");
  if (!loginBtn || !ctaBtn) return;

  if (user) {
    loginBtn.textContent = "Mon espace";
    loginBtn.setAttribute("href", "dashboard.html");
  }
});

/* =========================
   MENU MOBILE
========================= */
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================
   FAQ (accordéon)
========================= */
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (!question) return;

  question.addEventListener("click", () => {
    const wasActive = item.classList.contains("active");
    faqItems.forEach((other) => other.classList.remove("active"));
    if (!wasActive) item.classList.add("active");
  });
});

/* =========================
   CAPTURES DE TRADES (agrandissement)
========================= */
const lightbox = document.getElementById("lightbox");

if (lightbox) {
  const lightboxImg = lightbox.querySelector("img");

  document.querySelectorAll(".results-grid button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img) return;
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  };

  lightbox.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* =========================
   FORMULAIRE PROSPECT
========================= */
const leadForm = document.getElementById("lead-form");

if (leadForm) {
  const msg = document.getElementById("lead-msg");
  const submit = document.getElementById("lead-submit");

  const show = (type, text) => {
    msg.className = "form-msg " + type;
    msg.textContent = text;
  };

  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("lead-name").value.trim();
    const phone = document.getElementById("lead-phone").value.trim();
    const digits = phone.replace(/\D/g, "");

    if (name.length < 2) {
      show("err", "Indique ton prénom.");
      return;
    }
    if (digits.length < 8 || digits.length > 15) {
      show("err", "Indique un numéro WhatsApp valide, avec l'indicatif (ex : +243...).");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Envoi en cours...";

    try {
      await addDoc(collection(db, "leads"), {
        name: name,
        phone: phone,
        source: "accueil",
        contacted: false,
        createdAt: serverTimestamp()
      });
      leadForm.reset();
      show("ok", "Merci ! Nathan Trading te contacte sur WhatsApp très bientôt.");
    } catch (error) {
      console.error("Erreur prospect :", error);
      show("err", "Envoi impossible pour le moment. Écris-nous directement sur WhatsApp.");
    } finally {
      submit.disabled = false;
      submit.textContent = "Être recontacté sur WhatsApp";
    }
  });
}
