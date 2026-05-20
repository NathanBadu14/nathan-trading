import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

getFirestore,
collection,
addDoc

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* FIREBASE */

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

/* PROTECTION */

onAuthStateChanged(auth, (user)=>{

if(!user){

window.location.href =
"index.html";

}

});

/* SUPPORT FORM */

const supportForm =
document.getElementById("support-form");

supportForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const user =
auth.currentUser;

const message =
document.getElementById(
"support-message"
).value;

try{

await addDoc(
collection(db, "supports"),
{

email: user.email,

message: message,

createdAt: new Date()

}
);

alert("Message envoyé 🔥");

supportForm.reset();

}catch(error){

console.error(error);

alert("Erreur envoi");

}

});