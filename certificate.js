import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ADMIN_EMAIL = "badumisanathan807@gmail.com";
const TOTAL_MODULES = 18;

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

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Identifiant stable : dérivé de l'uid (FNV-1a 32 bits), donc identique à chaque visite
function genererIdCertificat(uid, annee) {
    let h = 0x811c9dc5;
    for (let i = 0; i < uid.length; i++) {
        h ^= uid.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return `NTA-${annee}-${h.toString(16).toUpperCase().padStart(8, "0")}`;
}

function formaterDate(date) {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getNom(data, user) {
    return data.username
        || data.name
        || user.displayName
        || (user.email ? user.email.split("@")[0] : "Trader");
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const adminLink = document.getElementById("admin-link");
    if (user.email === ADMIN_EMAIL && adminLink) {
        adminLink.style.display = "flex";
    }

    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
            window.location.href = "dashboard.html";
            return;
        }

        const data = userSnap.data();
        const modulesTermines = data.modulesTermines || [];

        if (modulesTermines.length < TOTAL_MODULES) {
            const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);
            alert(`Termine toute la formation pour obtenir ton certificat.\nProgression actuelle : ${progression}%`);
            window.location.href = "videos.html";
            return;
        }

        const nom = getNom(data, user);
        let annee = new Date().getFullYear();
        let idCertificat = genererIdCertificat(user.uid, annee);
        let dateFormatee = formaterDate(new Date());

        // Le certificat est émis une seule fois : on réutilise sa date d'émission ensuite
        const existant = await findCertificat(user.uid);
        if (existant) {
            idCertificat = existant.id;
            dateFormatee = existant.dateEmission;
        } else {
            try {
                await setDoc(doc(db, "certificates", idCertificat), {
                    id: idCertificat,
                    nom: nom,
                    uid: user.uid,
                    formation: "Nathan Trading Academy",
                    modules: TOTAL_MODULES,
                    dateEmission: dateFormatee,
                    createdAt: new Date(),
                    valide: true
                });
            } catch (e) {
                console.warn("Sauvegarde certificat :", e);
            }
        }

        document.getElementById("student-name").textContent = nom;
        document.getElementById("certificate-date").textContent = dateFormatee;
        document.getElementById("certificate-id").textContent = idCertificat;

        const downloadBtn = document.getElementById("download-certificate");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                telechargerCertificat(nom, dateFormatee, idCertificat);
            });
        }

    } catch (error) {
        console.error("Erreur Firestore :", error);
    }
});

// Retrouve le certificat déjà émis (l'identifiant dépend de l'année d'émission)
async function findCertificat(uid) {
    const anneeCourante = new Date().getFullYear();
    for (let a = anneeCourante; a >= anneeCourante - 3; a--) {
        const id = genererIdCertificat(uid, a);
        try {
            const snap = await getDoc(doc(db, "certificates", id));
            if (snap.exists() && snap.data().uid === uid) return snap.data();
        } catch (e) { /* règles non publiées : on ignore */ }
    }
    return null;
}

function telechargerCertificat(nom, date, idCertificat) {

    const n = esc(nom);
    const d = esc(date);
    const id = esc(idCertificat);

    const coin = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L40,0 L40,5 L5,5 L5,40 L0,40 Z" fill="#c9a84c"/><path d="M0,0 L30,0 L30,3 L3,3 L3,30 L0,30 Z" fill="#8b6914"/><circle cx="10" cy="10" r="3" fill="#c9a84c"/></svg>`;

    const contenu = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat ${id}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Dancing+Script:wght@700&family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4 landscape; margin: 0; }
        html, body { width: 297mm; height: 210mm; overflow: hidden; }
        body { font-family: 'Montserrat', sans-serif; background: #faf8f3; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cert { width: 297mm; height: 210mm; background: #faf8f3; position: relative; padding: 22mm 20mm 15mm; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
        .corner { position: absolute; width: 28mm; height: 28mm; }
        .corner-tl { top: 0; left: 0; }
        .corner-tr { top: 0; right: 0; transform: scaleX(-1); }
        .corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
        .corner-br { bottom: 0; right: 0; transform: scale(-1); }
        .corner svg { width: 100%; height: 100%; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Cinzel', serif; font-size: 60pt; font-weight: 700; color: rgba(0,0,0,0.035); white-space: nowrap; letter-spacing: 8mm; }
        .header { text-align: center; }
        .logo { width: 16mm; height: 16mm; object-fit: contain; border-radius: 50%; margin-bottom: 2mm; }
        .academy-name { font-family: 'Cinzel', serif; font-size: 8pt; letter-spacing: 4pt; color: #b8922f; text-transform: uppercase; margin-bottom: 3mm; }
        .divider-gold { display: flex; align-items: center; gap: 3mm; margin: 2mm 0; }
        .divider-gold::before, .divider-gold::after { content: ""; flex: 1; height: 0.3mm; background: linear-gradient(90deg, transparent, #c9a84c, transparent); }
        .divider-diamond { color: #c9a84c; font-size: 7pt; }
        .cert-title { font-family: 'Cinzel', serif; font-size: 28pt; color: #1a1a1a; line-height: 1; margin: 2mm 0 1mm; }
        .cert-title span { color: #b8922f; }
        .cert-subtitle { font-size: 7pt; letter-spacing: 3pt; color: #666; text-transform: uppercase; margin: 2mm 0; }
        .student-name { font-family: 'Cinzel', serif; font-size: 28pt; font-weight: 700; color: #1a1a1a; letter-spacing: 2pt; margin: 1mm 0; }
        .underline-gold { width: 55%; height: 0.4mm; background: linear-gradient(90deg, transparent, #c9a84c, transparent); margin: 1mm auto 3mm; }
        .description { font-size: 8pt; color: #444; line-height: 1.6; max-width: 170mm; margin: 0 auto; text-align: center; }
        .description strong { color: #1a1a1a; }
        .footer-grid { display: flex; justify-content: space-between; align-items: flex-start; border-top: 0.3mm solid #e0d5b5; padding-top: 4mm; gap: 5mm; }
        .footer-item { text-align: center; flex: 1; }
        .footer-label { font-size: 5.5pt; letter-spacing: 2pt; text-transform: uppercase; color: #8a8a8a; margin-bottom: 1.5mm; }
        .footer-value { font-size: 8pt; font-weight: 700; color: #1a1a1a; }
        .footer-sub { font-size: 6pt; color: #666; margin-top: 1mm; line-height: 1.4; }
        .signature-text { font-family: 'Dancing Script', cursive; font-size: 18pt; color: #1a1a1a; line-height: 1; }
        .citation { text-align: center; margin-top: 3mm; font-style: italic; color: #555; font-size: 7.5pt; }
        .citation-tags { text-align: center; margin-top: 1.5mm; font-size: 6pt; letter-spacing: 3pt; color: #8a8a8a; text-transform: uppercase; }
        .bottom-bar { background: #1a1a1a; margin: 3mm -20mm -15mm; padding: 3mm 20mm; display: flex; justify-content: space-between; align-items: center; }
        .bottom-bar-title { font-family: 'Cinzel', serif; font-size: 8pt; color: #c9a84c; letter-spacing: 3pt; }
        .bottom-bar-tagline { font-style: italic; font-size: 7pt; color: #c9a84c; }
    </style>
</head>
<body>
<div class="cert">
    <div class="watermark">TRADING</div>
    <div class="corner corner-tl">${coin}</div>
    <div class="corner corner-tr">${coin}</div>
    <div class="corner corner-bl">${coin}</div>
    <div class="corner corner-br">${coin}</div>
    <div class="header">
        <img src="https://nathan-trading.com/assets/image2.png" class="logo" alt="Nathan Trading">
        <div class="academy-name">Nathan Trading Academy</div>
        <div class="divider-gold"><span class="divider-diamond">&#9670;</span></div>
        <div class="cert-title">Certificat de <span>Réussite</span></div>
        <div class="divider-gold" style="margin:2mm 0;"><span class="divider-diamond">&#9670;</span></div>
        <div class="cert-subtitle">Ce certificat est décerné à</div>
        <div class="student-name">${n}</div>
        <div class="underline-gold"></div>
        <p class="description">Pour avoir terminé la formation <strong>Nathan Trading Academy</strong> (18 modules) et suivi les bases du trading, de l'analyse technique, de la gestion du risque et de la discipline du trader.</p>
    </div>
    <div class="footer-grid">
        <div class="footer-item">
            <div class="footer-label">Date d'émission</div>
            <div class="footer-value">${d}</div>
        </div>
        <div class="footer-item">
            <div class="footer-label">Formation</div>
            <div class="footer-value">Nathan Trading Academy</div>
            <div class="footer-sub">Formation complète<br>18 modules vidéo</div>
        </div>
        <div class="footer-item">
            <div class="footer-label">Signature</div>
            <div class="signature-text">Nathan Trading</div>
            <div class="footer-sub">Fondateur<br>Nathan Trading Academy</div>
        </div>
        <div class="footer-item">
            <div class="footer-label">ID du certificat</div>
            <div class="footer-value">${id}</div>
            <div class="footer-sub">Vérifiable sur<br>nathan-trading.com/verify.html</div>
        </div>
    </div>
    <div class="citation">Le succès en trading ne vient pas de la chance, mais de la discipline.</div>
    <div class="citation-tags">Discipline &nbsp;&bull;&nbsp; Gestion du risque &nbsp;&bull;&nbsp; Patience</div>
    <div class="bottom-bar">
        <div class="bottom-bar-title">NATHAN TRADING ACADEMY</div>
        <div class="bottom-bar-tagline">Former. Accompagner. Réussir.</div>
    </div>
</div>
<script>window.onload = function() { setTimeout(function() { window.print(); }, 1000); };</script>
</body>
</html>`;

    const fenetre = window.open("", "_blank");
    if (fenetre) {
        fenetre.document.write(contenu);
        fenetre.document.close();
    } else {
        alert("Autorise les popups pour télécharger le certificat.");
    }
}

const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Erreur déconnexion :", error);
        }
    });
}
