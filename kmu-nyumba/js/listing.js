import { db } from "./firebase-config.js";
import { renderNav } from "./nav.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

renderNav();

const container = document.getElementById("detail-container");
const id = new URLSearchParams(window.location.search).get("id");

function money(n) {
  return "KES " + Number(n).toLocaleString();
}

function waLink(phone, title) {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I'm interested in your listing: " + title + " on Nyumba.")}`;
}

async function load() {
  if (!id) {
    container.innerHTML += `<p>No listing specified.</p>`;
    return;
  }
  try {
    const snap = await getDoc(doc(db, "listings", id));
    if (!snap.exists()) {
      container.innerHTML = `<a href="index.html" class="back-link">&larr; Back to listings</a><p>This listing no longer exists.</p>`;
      return;
    }
    const l = snap.data();
    const images = l.images && l.images.length ? l.images : [];

    container.innerHTML = `
      <a href="index.html" class="back-link">&larr; Back to listings</a>
      <div class="detail-grid">
        <div class="detail-gallery">
          <div class="thumb" id="main-image">
            ${images[0] ? `<img src="${images[0]}" alt="${l.title}">` : "No photo yet"}
          </div>
          ${images.length > 1 ? `<div class="thumb-strip">
            ${images.map(src => `<img src="${src}" data-src="${src}">`).join("")}
          </div>` : ""}
        </div>
        <div class="detail-info">
          <h1>${l.title}</h1>
          <div class="meta" style="color:var(--ink-soft)">${l.location}${l.distance ? " · " + l.distance + " from KeMU" : ""}</div>
          <div class="detail-price">${money(l.price)} <small style="font-size:1rem;font-family:var(--font-body);color:var(--ink-soft)">/ month</small></div>
          <p>${l.description || ""}</p>

          <div class="contact-card">
            <h3>Contact ${l.landlordName || "the landlord"}</h3>
            ${l.contactPhone ? `<p><a href="tel:${l.contactPhone}" class="btn btn-dark btn-block" style="margin-bottom:8px">Call ${l.contactPhone}</a></p>` : ""}
            ${l.contactPhone ? `<p><a href="${waLink(l.contactPhone, l.title)}" target="_blank" class="btn btn-outline btn-block">Message on WhatsApp</a></p>` : ""}
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll(".thumb-strip img").forEach(t => {
      t.addEventListener("click", () => {
        document.getElementById("main-image").innerHTML = `<img src="${t.dataset.src}" alt="${l.title}">`;
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML += `<p>Couldn't load this listing. (${err.message})</p>`;
  }
}

load();
