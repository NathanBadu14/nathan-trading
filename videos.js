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
getDoc,
updateDoc

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

console.log("🔥 Videos page connectée");

/* =========================
   PROTECTION PAGE
========================= */

onAuthStateChanged(auth, async (user)=>{

if(user){

console.log("✅ Utilisateur connecté");

/* =========================
   RECUPERATION USER
========================= */

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const userData =
userSnap.data();

let progression =
userData.progression || 0;

console.log("🔥 Progression :", progression);

/* =========================
   DEBLOCAGE MODULES
========================= */

const lockedModules =
document.querySelectorAll(".locked");

/* NOMBRE MODULES DEBLOQUES */

const unlockedCount =
Math.floor(progression / 5);

for(let i = 0; i < unlockedCount; i++){

if(lockedModules[i]){

lockedModules[i].classList.remove("locked");

lockedModules[i].classList.add("unlocked");

}

}

/* =========================
   BOUTONS TERMINER
========================= */

const completeButtons =
document.querySelectorAll(".complete-btn");

completeButtons.forEach((button)=>{

button.addEventListener("click", async ()=>{

/* AJOUT PROGRESSION */

progression += 5;

/* MAXIMUM */

if(progression > 100){

progression = 100;

}

/* SAUVEGARDE */

await updateDoc(userRef, {

progression: progression

});

alert(
`Progression mise à jour : ${progression}% 🔥`
);

/* DEBLOCAGE SUIVANT */

const nextLocked =
document.querySelector(".locked");

if(nextLocked){

nextLocked.classList.remove("locked");

nextLocked.classList.add("unlocked");

}

/* DESACTIVE BOUTON */

button.innerHTML =
"✅ Module Terminé";

button.style.background =
"#00ffae";

button.style.color =
"black";
});

});

}

}else{

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

await signOut(auth);

window.location.href = "index.html";

});

}