import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

collection,
getDocs,
deleteDoc,
doc,
updateDoc,
setDoc,
query,
orderBy
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

/* =========================
   PUBLICATION ANNONCE
========================= */

const publishBtn =
document.getElementById(
"publish-announcement"
);

if(publishBtn){

publishBtn.addEventListener(
"click",
async ()=>{

const announcement =
document.getElementById(
"announcement-input"
).value;

if(announcement.trim() === ""){

alert("Écris une annonce");

return;

}

try{

await setDoc(
doc(db, "announcements", "latest"),
{

message: announcement,

createdAt: new Date()

}
);

alert("Annonce publiée ");

document.getElementById(
"announcement-input"
).value = "";

}catch(error){

console.error(error);

alert("Erreur publication");

}

});

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

<button
class="premium-btn"
data-id="${document.id}"
>

${data.premium ? "Retirer Premium" : "Activer Premium"}

</button>

<p>
🆔 UID : ${data.uid}
</p>

<button
class="premium-btn"
data-id="${document.id}"
data-premium="${data.premium}"
>

${data.premium ? "Retirer Premium" : "Activer Premium"}

</button>

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
   SUPPORT MESSAGES
========================= */

const supportContainer =
document.getElementById(
"support-messages"
);

const supportQuery =
query(
collection(db, "supports"),
orderBy("createdAt", "desc")
);

const supportSnapshot =
await getDocs(supportQuery);

supportContainer.innerHTML = "";

supportSnapshot.forEach((document)=>{

const data = document.data();

supportContainer.innerHTML += `

<div class="admin-card">

<h3>${data.email}</h3>

<p>
${data.message}
</p>

</div>

`;

});

/* =========================
   GESTION PREMIUM
========================= */

const premiumButtons =
document.querySelectorAll(".premium-btn");

premiumButtons.forEach((button)=>{

button.addEventListener("click", async ()=>{

const userId =
button.dataset.id;

const currentPremium =
button.dataset.premium === "true";

try{

await updateDoc(
doc(db, "users", userId),
{

premium: !currentPremium

}
);

alert("Statut Premium mis à jour 🔥");

window.location.reload();

}catch(error){

console.error(error);

alert("Erreur mise à jour premium");

}

});

});

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

/* =========================
   PREMIUM BUTTONS
========================= */

document.addEventListener(
"click",
async(e)=>{

if(
e.target.classList.contains(
"premium-btn"
)
){

const userId =
e.target.dataset.id;

const button =
e.target;

const isPremium =
button.innerHTML.includes(
"Retirer"
);

try{

await updateDoc(
doc(db, "users", userId),
{

premium: !isPremium

}
);

alert("Statut Premium mis à jour 🔥");

location.reload();

}catch(error){

console.error(error);

}

}

});