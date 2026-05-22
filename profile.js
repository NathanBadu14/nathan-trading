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

console.log("🔥 Profile Nathan Trading chargé");

/* ========================================
   AUTH USER
======================================== */

onAuthStateChanged(auth, async(user)=>{

if(user){

console.log("✅ Utilisateur connecté :", user.email);

/* ========================================
   ADMIN BUTTON
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

/* ========================================
   FIRESTORE USER
======================================== */

try{

const userRef =
doc(db,"users",user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data =
userSnap.data();

/* ========================================
   USERNAME
======================================== */

document.getElementById(
"profile-name"
).innerHTML =
data.name || "Étudiant Nathan Trading";

/* EMAIL */

document.getElementById(
"profile-email"
).innerHTML =
user.email;

/* UID */

document.getElementById(
"profile-uid"
).innerHTML =
user.uid;

/* PREMIUM */

document.getElementById(
"profile-premium"
).innerHTML =
data.premium
? "Premium Actif 👑"
: "Compte Standard";

/* ========================================
   PROGRESSION
======================================== */

const progress =
data.progression || 0;

document.getElementById(
"profile-progress"
).innerHTML =
`${progress}%`;

const progressFill =
document.getElementById(
"profile-progress-fill"
);

if(progressFill){

progressFill.style.width =
`${progress}%`;

progressFill.innerHTML =
`${progress}%`;

}

/* ========================================
   DATE INSCRIPTION
======================================== */

if(data.createdAt){

const date =
data.createdAt.toDate();

document.getElementById(
"profile-created"
).innerHTML =
date.toLocaleDateString(
"fr-FR"
);

}else{

document.getElementById(
"profile-created"
).innerHTML =
"Non disponible";

}

}else{

console.error(
"❌ Utilisateur introuvable"
);

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