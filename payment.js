import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const PRICE_USD = 199;

/* =========================
   ÉLÉMENTS
========================= */
const el = (id) => document.getElementById(id);

const loading = el("pay-loading");
const guest = el("pay-guest");
const premiumBox = el("pay-premium");
const pendingBox = el("pay-pending");
const pendingDetail = el("pay-pending-detail");
const form = el("pay-form");
const rejectedNote = el("pay-rejected");
const msg = el("pay-msg");
const submitBtn = el("pay-submit");
const navSpace = el("nav-space");

function hideAll() {
    [loading, guest, premiumBox, pendingBox, form].forEach((n) => {
        if (n) n.style.display = "none";
    });
}

function showMsg(type, text) {
    msg.className = "form-msg " + type;
    msg.textContent = text;
}

/* =========================
   COPIER UN NUMÉRO
========================= */
document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const value = btn.getAttribute("data-copy");
        try {
            await navigator.clipboard.writeText(value);
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            btn.style.color = "var(--green)";
        } catch (e) {
            window.prompt("Copie ce numéro :", value);
        }
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            btn.style.color = "";
        }, 1800);
    });
});

/* =========================
   ÉTAT SELON LE COMPTE
========================= */
onAuthStateChanged(auth, async (user) => {
    hideAll();

    if (!user) {
        guest.style.display = "block";
        return;
    }

    if (navSpace) navSpace.style.display = "inline-flex";
    loading.style.display = "block";

    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};

        if (userData.premium) {
            hideAll();
            premiumBox.style.display = "block";
            return;
        }

        const paymentsSnap = await getDocs(
            query(collection(db, "payments"), where("uid", "==", user.uid))
        );

        const payments = paymentsSnap.docs
            .map((d) => d.data())
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        const last = payments[0];

        hideAll();

        if (last && last.status === "pending") {
            pendingBox.style.display = "block";
            pendingDetail.textContent = `Référence déclarée : ${last.reference} (${last.method})`;
            return;
        }

        form.style.display = "grid";
        rejectedNote.style.display = last && last.status === "rejected" ? "block" : "none";

    } catch (error) {
        console.error("Erreur paiement :", error);
        hideAll();
        form.style.display = "grid";
        rejectedNote.style.display = "none";
    }
});

/* =========================
   ENVOI DE LA DÉCLARATION
========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        showMsg("err", "Connecte-toi pour déclarer ton paiement.");
        return;
    }

    const method = el("pay-method").value;
    const reference = el("pay-ref").value.trim();
    const payerPhone = el("pay-phone").value.trim();

    if (!method) {
        showMsg("err", "Choisis le moyen de paiement utilisé.");
        return;
    }
    if (reference.length < 4) {
        showMsg("err", "Indique la référence de ta transaction (au moins 4 caractères).");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    try {
        let name = "";
        try {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) name = snap.data().username || snap.data().name || "";
        } catch (e2) { /* le nom est facultatif */ }

        await addDoc(collection(db, "payments"), {
            uid: user.uid,
            email: user.email || "",
            name: name,
            method: method,
            reference: reference,
            payerPhone: payerPhone,
            amount: PRICE_USD,
            status: "pending",
            createdAt: serverTimestamp()
        });

        hideAll();
        pendingBox.style.display = "block";
        pendingDetail.textContent = `Référence déclarée : ${reference} (${method})`;

    } catch (error) {
        console.error("Erreur déclaration :", error);
        showMsg("err", "Envoi impossible pour le moment. Réessaie ou envoie ta preuve sur WhatsApp.");
        submitBtn.disabled = false;
        submitBtn.textContent = "J'ai payé 199 $ — déclarer mon paiement";
    }
});
