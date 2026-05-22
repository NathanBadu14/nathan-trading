import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

getFirestore,
collection,
addDoc

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ========================================
   ADMIN EMAIL
======================================== */

const ADMIN_EMAIL =
"badumisanathan807@gmail.com";

/* ========================================
   FIREBASE CONFIG
======================================== */

const firebaseConfig = {

apiKey: "AIzaSyC6JiynxWiPQVjqZ-UMGpSyI9f_aDqxEGc",

authDomain: "nathan-trading.firebaseapp.com",

projectId: "nathan-trading",

storageBucket: "nathan-trading.firebasestorage.app",

messagingSenderId: "908084098772",

appId: "1:908084098772:web:c99392d2e52a10f1e7ed41"

};

/* ========================================
   INITIALISATION
======================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

console.log("🔥 Support Nathan Trading chargé");

/* ========================================
   AUTH PROTECTION
======================================== */

onAuthStateChanged(auth, (user)=>{

if(user){

console.log(
"✅ Utilisateur connecté :",
user.email
);

/* ========================================
   ADMIN LINK
======================================== */

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

}else{

window.location.href =
"index.html";

}

});

/* ========================================
   LOGOUT
======================================== */

const logoutBtn =
document.querySelector(
".logout-btn"
);

if(logoutBtn){

logoutBtn.addEventListener(
"click",
async()=>{

try{

await signOut(auth);

alert(
"Déconnexion réussie 🔥"
);

window.location.href =
"index.html";

}catch(error){

console.error(
"Erreur déconnexion :",
error
);

}

});

}

/* ========================================
   SUPPORT FORM
======================================== */

const supportForm =
document.getElementById(
"support-form"
);

if(supportForm){

supportForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const user =
auth.currentUser;

if(!user){

alert(
"Vous devez être connecté."
);

return;

}

const message =
document.getElementById(
"support-message"
).value;

/* VERIFICATION MESSAGE */

if(message.trim() === ""){

alert(
"Veuillez écrire un message."
);

return;

}

try{

await addDoc(
collection(db, "supports"),
{

email: user.email,

message: message,

createdAt: new Date()

}
);

alert(
"Message envoyé avec succès 🔥"
);

supportForm.reset();

}catch(error){

console.error(
"Erreur support :",
error
);

alert(
"Erreur lors de l'envoi."
);

}

});

}