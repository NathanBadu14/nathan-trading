import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
    authDomain: "nathan-trading.firebaseapp.com",
    projectId: "nathan-trading",
    storageBucket: "nathan-trading.firebasestorage.app",
    messagingSenderId: "908084098772",
    appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
});
const db = getFirestore(app);

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const form = document.getElementById("verify-form");
const result = document.getElementById("verify-result");
const input = document.getElementById("cert-id");

// Permet un lien direct : verify.html?id=NTA-2026-XXXXXXXX
const idUrl = new URLSearchParams(window.location.search).get("id");
if (idUrl) {
    input.value = idUrl;
    verifier(idUrl);
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    verifier(input.value);
});

async function verifier(valeur) {
    const id = valeur.trim().toUpperCase();
    result.className = "verify-result";
    if (!/^NTA-\d{4}-[0-9A-F]{8}$/.test(id)) {
        result.className = "verify-result ko";
        result.textContent = "Format d'identifiant invalide.";
        return;
    }
    try {
        const snap = await getDoc(doc(db, "certificates", id));
        if (snap.exists() && snap.data().valide !== false) {
            const d = snap.data();
            result.className = "verify-result ok";
            result.innerHTML = `<strong>Certificat authentique.</strong><br>Décerné à <strong>${esc(d.nom)}</strong><br>Formation : ${esc(d.formation)}<br>Date d'émission : ${esc(d.dateEmission)}`;
        } else {
            result.className = "verify-result ko";
            result.textContent = "Aucun certificat valide ne correspond à cet identifiant.";
        }
    } catch (err) {
        console.error(err);
        result.className = "verify-result ko";
        result.textContent = "Vérification impossible pour le moment. Réessaie plus tard.";
    }
}
