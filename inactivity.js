import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* ===========================
   DÉCONNEXION AUTOMATIQUE
   Après 30 minutes d'inactivité,
   avec avertissement 2 minutes avant.
=========================== */

const DELAI_INACTIVITE = 30 * 60 * 1000;
const AVERTISSEMENT_AVANT = 2 * 60 * 1000;

let timerInactivite;
let timerAvertissement;
let intervalCompteARebours;
let banniereAffichee = false;

function creerBanniere() {
    const banniere = document.createElement("div");
    banniere.id = "banniere-inactivite";
    banniere.setAttribute("role", "alert");
    banniere.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        width: calc(100% - 32px); max-width: 520px;
        background: #0d151b; border: 1px solid #ff5d5d; color: #eaf2f7;
        padding: 16px 20px; border-radius: 16px;
        font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px;
        z-index: 99999; display: flex; align-items: center; justify-content: space-between;
        gap: 14px; flex-wrap: wrap; box-shadow: 0 10px 40px rgba(0,0,0,0.55);
    `;
    banniere.innerHTML = `
        <span>Tu seras déconnecté dans <strong id="compte-a-rebours">2:00</strong> pour inactivité.</span>
        <button type="button" id="btn-rester-connecte" style="
            padding: 9px 16px; background: #19e3ff; color: #05080b; border: none;
            border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit;
        ">Rester connecté</button>
    `;
    document.body.appendChild(banniere);
    document.getElementById("btn-rester-connecte").addEventListener("click", reinitialiserInactivite);
}

function supprimerBanniere() {
    clearInterval(intervalCompteARebours);
    const banniere = document.getElementById("banniere-inactivite");
    if (banniere) banniere.remove();
    banniereAffichee = false;
}

function demarrerCompteARebours() {
    let secondesRestantes = AVERTISSEMENT_AVANT / 1000;
    clearInterval(intervalCompteARebours);
    intervalCompteARebours = setInterval(() => {
        secondesRestantes--;
        const el = document.getElementById("compte-a-rebours");
        if (el) {
            const min = Math.floor(secondesRestantes / 60);
            const sec = secondesRestantes % 60;
            el.textContent = `${min}:${String(sec).padStart(2, "0")}`;
        }
        if (secondesRestantes <= 0) clearInterval(intervalCompteARebours);
    }, 1000);
}

async function deconnecterPourInactivite() {
    supprimerBanniere();
    try {
        await signOut(getAuth());
    } catch (error) {
        console.error("Erreur déconnexion automatique :", error);
    }
    window.location.href = "connexion.html";
}

export function reinitialiserInactivite() {
    clearTimeout(timerInactivite);
    clearTimeout(timerAvertissement);
    supprimerBanniere();

    timerAvertissement = setTimeout(() => {
        if (!banniereAffichee) {
            banniereAffichee = true;
            creerBanniere();
            demarrerCompteARebours();
        }
    }, DELAI_INACTIVITE - AVERTISSEMENT_AVANT);

    timerInactivite = setTimeout(deconnecterPourInactivite, DELAI_INACTIVITE);
}

// Pendant l'avertissement, seul le bouton « Rester connecté » prolonge la session.
// Hors avertissement, toute activité remet le compteur à zéro (limité à 1 fois / seconde).
let dernierReset = 0;
function activite() {
    if (banniereAffichee) return;
    const maintenant = Date.now();
    if (maintenant - dernierReset < 1000) return;
    dernierReset = maintenant;
    reinitialiserInactivite();
}

["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, activite, { passive: true });
});

reinitialiserInactivite();
