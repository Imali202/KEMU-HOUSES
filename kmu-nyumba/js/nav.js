import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Renders the top nav and swaps links depending on whether a landlord
// is logged in. Call renderNav() once on every page.
export function renderNav() {
  const el = document.getElementById("site-nav");
  if (!el) return;

  onAuthStateChanged(auth, (user) => {
    el.innerHTML = `
      <div class="wrap">
        <a href="index.html" class="brand">Nyumba <span>housing near KeMU</span></a>
        <div class="nav-links">
          <a href="index.html">Browse</a>
          ${
            user
              ? `<a href="dashboard.html">My listings</a>
                 <a href="#" id="logout-link" class="btn btn-outline on-dark">Log out</a>`
              : `<a href="login.html" class="btn btn-outline on-dark">Landlord login</a>`
          }
        </div>
      </div>
    `;
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "index.html";
      });
    }
  });
}
