import { auth } from "./firebase-config.js";
import { renderNav } from "./nav.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

renderNav();

const form = document.getElementById("login-form");
const msg = document.getElementById("form-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    msg.className = "form-msg error";
    msg.textContent = err.message.replace("Firebase: ", "");
  }
});
