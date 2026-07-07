import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ADMIN_EMAIL = "badumisanathan807@gmail.com";

const firebaseConfig = {
    apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",
    authDomain: "nathan-trading.firebaseapp.com",
    projectId: "nathan-trading",
    storageBucket: "nathan-trading.firebasestorage.app",
    messagingSenderId: "908084098772",
    appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"
};

const TOTAL_MODULES = 18;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================
   AUTH
=========================== */

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

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("Utilisateur introuvable.");
            window.location.href = "dashboard.html";
            return;
        }

        const data = userSnap.data();
        const modulesTermines = data.modulesTermines || [];
        const progression = Math.round((modulesTermines.length / TOTAL_MODULES) * 100);

        // Vérification 100%
        if (progression < 100) {
            alert(`Terminez toute la formation pour obtenir votre certificat.\nProgression actuelle : ${progression}%`);
            window.location.href = "videos.html";
            return;
        }

        const nom = data.username || data.name || "Étudiant Nathan Trading";
        const today = new Date();
        const dateFormatee = today.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // Remplir le certificat
        const nameEl = document.getElementById("student-name");
        if (nameEl) nameEl.innerHTML = nom;

        const dateEl = document.getElementById("certificate-date");
        if (dateEl) dateEl.innerHTML = dateFormatee;

        // Bouton téléchargement PDF
        const downloadBtn = document.getElementById("download-certificate");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                telechargerCertificat(nom, dateFormatee);
            });
        }

    } catch (error) {
        console.error("Erreur Firestore :", error);
    }
});

/* ===========================
   GÉNÉRATION PDF
=========================== */

function telechargerCertificat(nom, date) {

    const contenu = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Poppins', sans-serif;
                    background: #fff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 40px;
                }
                .cert {
                    width: 900px;
                    border: 8px double #d4af37;
                    padding: 60px;
                    text-align: center;
                    background: #fff;
                    position: relative;
                }
                .cert::before {
                    content: "";
                    position: absolute;
                    inset: 12px;
                    border: 2px solid #d4af37;
                    opacity: 0.4;
                    pointer-events: none;
                }
                .logo {
                    font-size: 13px;
                    letter-spacing: 5px;
                    color: #888;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .titre {
                    font-size: 42px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin: 20px 0 10px;
                }
                .titre span { color: #d4af37; }
                .sous-titre {
                    font-size: 15px;
                    color: #666;
                    margin-bottom: 30px;
                }
                .divider {
                    width: 80px;
                    height: 3px;
                    background: #d4af37;
                    margin: 0 auto 30px;
                    border-radius: 10px;
                }
                .decerne {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 15px;
                }
                .nom {
                    font-size: 38px;
                    font-weight: 700;
                    color: #1a1a1a;
                    border-bottom: 2px solid #d4af37;
                    display: inline-block;
                    padding-bottom: 8px;
                    margin-bottom: 30px;
                }
                .description {
                    font-size: 15px;
                    color: #555;
                    line-height: 1.8;
                    max-width: 600px;
                    margin: 0 auto 40px;
                }
                .infos {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 40px;
                    border-top: 1px solid #eee;
                    padding-top: 30px;
                }
                .info-bloc h4 {
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #999;
                    margin-bottom: 8px;
                }
                .info-bloc p {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .avertissement {
                    margin-top: 30px;
                    font-size: 11px;
                    color: #aaa;
                    font-style: italic;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }
            </style>
        </head>
        <body>
            <div class="cert">
                <p class="logo">Nathan Trading Academy</p>
                <div class="divider"></div>
                <h1 class="titre">Certificat de <span>Réussite</span></h1>
                <p class="sous-titre">Formation Nathan Trading Academy — Complète</p>
                <p class="decerne">Ce certificat est officiellement décerné à</p>
                <h2 class="nom">${nom}</h2>
                <p class="description">
                    Pour avoir terminé avec succès la formation Nathan Trading Academy
                    et démontré une compréhension des bases du trading,
                    de l'analyse technique, de la gestion du risque
                    et de la discipline du trader.
                </p>
                <div class="infos">
                    <div class="info-bloc">
                        <h4>Date</h4>
                        <p>${date}</p>
                    </div>
                    <div class="info-bloc">
                        <h4>Formation</h4>
                        <p>Nathan Trading Academy</p>
                    </div>
                    <div class="info-bloc">
                        <h4>Signature</h4>
                        <p>Nathan Trading</p>
                    </div>
                </div>
                <p class="avertissement">
                    Ce certificat atteste uniquement de la participation et de la réussite
                    à un programme éducatif. Il ne constitue pas un conseil financier
                    ni une garantie de résultats en trading.
                </p>
            </div>
        </body>
        </html>
    `;

    const fenetre = window.open("", "_blank");
    fenetre.document.write(contenu);
    fenetre.document.close();

    // Attendre le chargement des polices puis imprimer
    fenetre.onload = () => {
        setTimeout(() => {
            fenetre.print();
        }, 800);
    };
}

/* ===========================
   DÉCONNEXION
=========================== */

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