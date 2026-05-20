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

/* USER */

onAuthStateChanged(auth, async(user)=>{

if(user){

document.getElementById(
"profile-name"
).innerHTML = user.email;

document.getElementById(
"profile-email"
).innerHTML = user.email;

document.getElementById(
"profile-uid"
).innerHTML = user.uid;

/* FIRESTORE */

const userRef =
doc(db,"users",user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data =
userSnap.data();

/* PREMIUM */

document.getElementById(
"profile-premium"
).innerHTML =
data.premium
? "Premium Actif 👑"
: "Compte Standard";

/* PROGRESSION */

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

progressFill.style.width =
`${progress}%`;

progressFill.innerHTML =
`${progress}%`;

/* DATE */

if(data.createdAt){

const date =
data.createdAt.toDate();

document.getElementById(
"profile-created"
).innerHTML =
date.toLocaleDateString(
"fr-FR"
);

}

}

}else{

window.location.href =
"index.html";

}

});

/* LOGOUT */

const logoutBtn =
document.querySelector(
".logout-btn"
);

if(logoutBtn){

logoutBtn.addEventListener(
"click",
async()=>{

await signOut(auth);

window.location.href =
"index.html";

});

}