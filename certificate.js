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

console.log("🔥 Certificate Nathan Trading chargé");

/* ========================================
   AUTH USER
======================================== */

onAuthStateChanged(auth, async(user)=>{

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

/* ========================================
   FIRESTORE USER
======================================== */

try{

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data =
userSnap.data();

/* ========================================
   VERIFICATION FORMATION
======================================== */

if((data.progression || 0) < 100){

alert(
"Terminez toute la formation pour obtenir votre certificat."
);

window.location.href =
"videos.html";

return;

}

/* ========================================
   NOM ELEVE
======================================== */

document.getElementById(
"student-name"
).innerHTML =
data.name || "Étudiant Nathan Trading";

/* ========================================
   DATE CERTIFICAT
======================================== */

const today =
new Date();

document.getElementById(
"certificate-date"
).innerHTML =
`Date : ${today.toLocaleDateString("fr-FR")}`;

}else{

alert(
"Utilisateur introuvable."
);

window.location.href =
"dashboard.html";

}

}catch(error){

console.error(
"Erreur Firestore :",
error
);

}

}else{

window.location.href =
"index.html";

}

});

/* ========================================
   DOWNLOAD CERTIFICATE
======================================== */

const downloadBtn =
document.getElementById(
"download-certificate"
);

if(downloadBtn){

downloadBtn.addEventListener(
"click",
()=>{

window.print();

});

}

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