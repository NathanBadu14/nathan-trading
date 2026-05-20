import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {

getFirestore,
doc,
setDoc

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🚀 Script chargé avec succès !");

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

console.log("🔥 Firebase connecté avec succès");

/* =========================
   SESSION UTILISATEUR
========================= */

onAuthStateChanged(auth, (user) => {

if(user){

console.log("✅ Utilisateur connecté :", user.email);

}else{

console.log("❌ Aucun utilisateur connecté");

}

});

/* =========================
   INSCRIPTION
========================= */

const registerForm =
document.getElementById("register-form");

if(registerForm){

console.log("✅ Formulaire inscription détecté");

registerForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const email =
document.getElementById("register-email").value;

const password =
document.getElementById("register-password").value;

try{

const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

const user = userCredential.user;

console.log("🔥 Compte créé :", user);

/* =========================
   SAUVEGARDE FIRESTORE
========================= */

await setDoc(doc(db, "users", user.uid), {

email: user.email,

uid: user.uid,

premium: false,

progression: 0,

completedModules: [],

createdAt: new Date()

});

console.log("✅ Utilisateur enregistré dans Firestore");

alert("Compte créé avec succès 🔥");

/* REDIRECTION */

window.location.href = "dashboard.html";

}catch(error){

console.error(error);

if(error.code === "auth/email-already-in-use"){

alert("Cet email est déjà utilisé.");

}else if(error.code === "auth/weak-password"){

alert("Le mot de passe doit contenir au moins 6 caractères.");

}else{

alert(error.message);

}

}

});

}else{

console.error("❌ Formulaire inscription introuvable");

}

/* =========================
   CONNEXION
========================= */

const loginForm =
document.getElementById("login-form");

if(loginForm){

console.log("✅ Formulaire connexion détecté");

loginForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const email =
document.getElementById("login-email").value;

const password =
document.getElementById("login-password").value;

try{

const userCredential =
await signInWithEmailAndPassword(
auth,
email,
password
);

console.log("✅ Connexion réussie :", userCredential.user);

alert("Bienvenue sur Nathan Trading 🔥");

/* REDIRECTION */

window.location.href = "dashboard.html";

}catch(error){

console.error(error);

if(
error.code === "auth/invalid-credential"
){

alert("Email ou mot de passe incorrect.");

}else{

alert(error.message);

}

}

});

}else{

console.error("❌ Formulaire connexion introuvable");

}