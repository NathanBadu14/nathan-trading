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

const db = getFirestore(app);

console.log("🔥 Dashboard connecté");

/* =========================
   PROTECTION + PROFIL
========================= */

onAuthStateChanged(auth, async (user)=>{

if(user){

console.log("✅ Utilisateur connecté :", user.email);

/* RECUPERATION FIRESTORE */

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

/* ELEMENTS HTML */

const welcomeMessage =
document.getElementById("welcome-message");

const studentEmail =
document.getElementById("student-email");

/* SI UTILISATEUR EXISTE */

if(userSnap.exists()){

const userData =
userSnap.data();

console.log("🔥 Données utilisateur :", userData);

/* AFFICHAGE */

welcomeMessage.innerHTML =
`Bienvenue ${userData.email} 🔥`;

studentEmail.innerHTML =
`Statut : Premium Student`;

const progressBar =
document.getElementById("progress-bar");

const progressText =
document.getElementById("progress-text");

/* ANIMATION */

progressBar.style.width =
`${userData.progression}%`;

progressText.innerHTML =
`${userData.progression}% complété`;

}else{

/* SECURITE SI AUCUNE DONNEE */

welcomeMessage.innerHTML =
`Bienvenue ${user.email} 🔥`;

studentEmail.innerHTML =
`Compte Premium`;

}

}else{

console.log("❌ Aucun utilisateur connecté");

window.location.href = "index.html";

}

});

/* =========================
   DECONNEXION
========================= */

const logoutBtn =
document.querySelector(".logout-btn");

if(logoutBtn){

logoutBtn.addEventListener("click", async ()=>{

try{

await signOut(auth);

window.location.href = "index.html";

}catch(error){

console.error(error);

}

});

}