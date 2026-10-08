import { auth, db } from "./firebase-config.js";
import { renderNav } from "./nav.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

renderNav();

const form = document.getElementById("signup-form");
const msg = document.getElementById("form-msg");

function showError(text) {
  msg.className = "form-msg error";
  msg.textContent = text;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, phone, email, role: "landlord", createdAt: serverTimestamp()
    });
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    showError(err.message.replace("Firebase: ", ""));
  }
});
