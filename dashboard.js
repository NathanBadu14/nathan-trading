import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

getFirestore,
doc,
getDoc

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* =========================
   ADMIN EMAIL
========================= */

const ADMIN_EMAIL =
"badumisanathan807@gmail.com";

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

/* =========================
   INITIALISATION
========================= */

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);

console.log(
"🔥 Dashboard Nathan Trading chargé"
);

/* =========================
   PROTECTION PAGE
========================= */

onAuthStateChanged(auth, async(user)=>{

if(user){

console.log(
"✅ Utilisateur connecté :",
user.email
);

/* =========================
   BOUTON ADMIN
========================= */

const adminLink =
document.getElementById(
"admin-link"
);

if(user.email === ADMIN_EMAIL){

if(adminLink){

adminLink.style.display =
"flex";

}

}

/* =========================
   RECUPERATION USER
========================= */

try{

const userRef =
doc(db,"users",user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data =
userSnap.data();

/* =========================
   BIENVENUE PRENOM
========================= */

const welcomeMessage =
document.getElementById(
"welcome-message"
);

if(welcomeMessage){

welcomeMessage.innerHTML =
`Bienvenue ${data.name || "Trader"} 🔥`;

}

/* =========================
   PROGRESSION
========================= */

const progress =
data.progression || 0;

const progressFill =
document.getElementById(
"progress-fill"
);

const progressText =
document.getElementById(
"progress-text"
);

if(progressFill){

progressFill.style.width =
`${progress}%`;

progressFill.innerHTML =
`${progress}%`;

}

if(progressText){

progressText.innerHTML =
`${progress}% terminé`;

}

/* =========================
   PREMIUM BADGE
========================= */

const premiumBadge =
document.querySelector(
".premium-badge"
);

if(premiumBadge){

if(data.premium){

premiumBadge.innerHTML = `

<i class="fa-solid fa-crown"></i>

<span>
Premium Student
</span>

`;

}else{

premiumBadge.innerHTML = `

<i class="fa-solid fa-lock"></i>

<span>
Compte Standard
</span>

`;

}

}

}

}catch(error){

console.error(
"❌ Erreur Firestore :",
error
);

}

}else{

window.location.href =
"index.html";

}

});

/* =========================
   DECONNEXION
========================= */

const logoutBtn =
document.querySelector(
".logout-btn"
);

if(logoutBtn){

logoutBtn.addEventListener(
"click",
async ()=>{

try{

await signOut(auth);

alert(
"Déconnexion réussie 🔥"
);

window.location.href =
"index.html";

}catch(error){

console.error(
"❌ Erreur déconnexion :",
error
);

}

});

}else{

console.error(
"❌ Bouton logout introuvable"
);

}