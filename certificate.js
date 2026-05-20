import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

getAuth,
onAuthStateChanged

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

/* PROTECTION */

onAuthStateChanged(auth, async(user)=>{

if(user){

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data =
userSnap.data();

/* VERIFICATION FIN */

if(data.progression < 100){

alert(
"Terminez la formation pour obtenir le certificat."
);

window.location.href =
"videos.html";

return;

}

/* NOM */

document.getElementById(
"student-name"
).innerHTML =
user.email.split("@")[0];

/* DATE */

const today =
new Date();

document.getElementById(
"certificate-date"
).innerHTML =
`Date : ${today.toLocaleDateString()}`;

}

}else{

window.location.href =
"index.html";

}

});

/* DOWNLOAD */

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