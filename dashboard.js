import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

console.log("🔥 Dashboard connecté");

/* =========================
   PROTECTION PAGE
========================= */

onAuthStateChanged(auth, (user)=>{

if(user){

console.log("✅ Utilisateur connecté :", user.email);

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