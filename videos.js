import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

}


from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {

getFirestore,
doc,
getDoc,
collection,
addDoc,
getDocs,
query,
orderBy

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

const db = getFirestore(app);

const db = getFirestore(app);

console.log("🔥 Videos page connectée");

/* =========================
   PROTECTION PAGE
========================= */

onAuthStateChanged(auth, async (user)=>{

if(user){

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

const userData =
userSnap.data();

/* PREMIUM LOCK */

if(!userData.premium){

alert(
"Accès réservé aux élèves Premium."
);

window.location.href =
"payment.html";

return;

}

   const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

const userData =
userSnap.data();

/* VERIFICATION PREMIUM */

if(!userData.premium){

alert(
"Accès Premium requis"
);

window.location.href =
"dashboard.html";

return;

}

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

/* =========================
   COMMENTAIRES
========================= */

const commentForms =
document.querySelectorAll(
".comment-form"
);

commentForms.forEach((form,index)=>{

form.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const input =
form.querySelector(
".comment-input"
);

const message =
input.value;

const user =
auth.currentUser;

try{

await addDoc(
collection(db, "comments"),
{

videoId: index,

email: user.email,

message: message,

createdAt: new Date()

}
);

alert("Commentaire envoyé 🔥");

input.value = "";

loadComments();

}catch(error){

console.error(error);

}

});

});

/* =========================
   LOAD COMMENTS
========================= */

async function loadComments(){

const containers =
document.querySelectorAll(
".comments-container"
);

containers.forEach(container=>{

container.innerHTML = "";

});

const commentsQuery =
query(
collection(db,"comments"),
orderBy("createdAt","desc")
);

const snapshot =
await getDocs(commentsQuery);

snapshot.forEach((document)=>{

const data =
document.data();

const container =
containers[data.videoId];

if(container){

container.innerHTML += `

<div class="comment-card">

<h4>${data.email}</h4>

<p>${data.message}</p>

</div>

`;

}

});

}

loadComments();