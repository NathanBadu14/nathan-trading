import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

getFirestore,
collection,
getDocs,
deleteDoc,
doc

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* =========================
   FIREBASE
========================= */

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

/* =========================
   ADMIN EMAIL
========================= */

const ADMIN_EMAIL =
"badumisanathan807@gmail.com";

/* =========================
   SECURITE ADMIN
========================= */

onAuthStateChanged(auth, async(user)=>{

if(user){

/* VERIFICATION ADMIN */

if(user.email !== ADMIN_EMAIL){

alert("⛔ Accès refusé");

window.location.href =
"dashboard.html";

return;

}

console.log("👑 Admin connecté");

/* =========================
   CONTAINER
========================= */

const usersContainer =
document.getElementById("admin-users");

usersContainer.innerHTML = "";

/* =========================
   RECUPERATION USERS
========================= */

const querySnapshot =
await getDocs(collection(db, "users"));

/* =========================
   VARIABLES STATS
========================= */

let totalUsers = 0;

let premiumUsers = 0;

let totalProgression = 0;

/* =========================
   AFFICHAGE USERS
========================= */

querySnapshot.forEach((document)=>{

const data = document.data();

totalUsers++;

if(data.premium){

premiumUsers++;

}

totalProgression +=
data.progression || 0;

/* AJOUT HTML */

usersContainer.innerHTML += `

<div class="admin-card">

<h3>${data.email}</h3>

<p>
📈 Progression : ${data.progression || 0}%
</p>

<p>
👑 Premium : ${data.premium ? "Oui" : "Non"}
</p>

<p>
🆔 UID : ${data.uid}
</p>

<button
class="delete-user-btn"
data-id="${document.id}"
>

Supprimer

</button>

</div>

`;

});

/* =========================
   CALCUL MOYENNE
========================= */

const average =
totalUsers > 0
? Math.floor(totalProgression / totalUsers)
: 0;

/* =========================
   AFFICHAGE STATS
========================= */

document.getElementById(
"total-users"
).innerHTML = totalUsers;

document.getElementById(
"premium-users"
).innerHTML = premiumUsers;

document.getElementById(
"average-progress"
).innerHTML = `${average}%`;

/* =========================
   SUPPRESSION USER
========================= */

const deleteButtons =
document.querySelectorAll(".delete-user-btn");

deleteButtons.forEach((button)=>{

button.addEventListener("click", async ()=>{

const confirmDelete =
confirm(
"Supprimer cet utilisateur ?"
);

if(confirmDelete){

const userId =
button.dataset.id;

try{

await deleteDoc(
doc(db, "users", userId)
);

alert("Utilisateur supprimé 🔥");

window.location.reload();

}catch(error){

console.error(error);

alert("Erreur suppression");

}

}

});

});

}else{

window.location.href =
"index.html";

}

});