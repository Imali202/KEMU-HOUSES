import { db } from "./firebase-config.js";
import { renderNav } from "./nav.js";
import { collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

renderNav();

const grid = document.getElementById("listings-grid");
const countEl = document.getElementById("result-count");
const form = document.getElementById("search-form");

let allListings = [];

function money(n) {
  return "KES " + Number(n).toLocaleString();
}

function typeLabel(t) {
  const map = {
    bedsitter: "Bedsitter", single: "Single room", "1bdrm": "1 bedroom",
    "2bdrm": "2 bedroom", hostel: "Hostel"
  };
  return map[t] || t;
}

function cardHTML(listing) {
  const img = listing.images && listing.images[0];
  return `
    <a class="listing-card" href="listing.html?id=${listing.id}">
      <div class="thumb">
        ${img ? `<img src="${img}" alt="${listing.title}">` : "No photo yet"}
      </div>
      <div class="body">
        <div class="price">${money(listing.price)} <small>/ month</small></div>
        <h3>${listing.title}</h3>
        <div class="meta">${listing.location}${listing.distance ? " · " + listing.distance + " from KeMU" : ""}</div>
        <div class="tags"><span class="tag">${typeLabel(listing.type)}</span></div>
      </div>
    </a>
  `;
}

function render(list) {
  countEl.textContent = list.length === 1 ? "1 listing" : `${list.length} listings`;
  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <h3>No listings match yet</h3>
      <p>Try a wider price range, or check back soon — new places get posted often.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(cardHTML).join("");
}

async function loadListings() {
  grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Loading listings…</div>`;
  try {
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    allListings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render(allListings);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <h3>Couldn't load listings</h3>
      <p>Check that your Firebase config in js/firebase-config.js is filled in correctly. (${err.message})</p>
    </div>`;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("q").value.trim().toLowerCase();
  const maxPrice = document.getElementById("max-price").value;
  const bedrooms = document.getElementById("bedrooms").value;

  let filtered = allListings;
  if (q) {
    filtered = filtered.filter(l =>
      (l.title + " " + l.location + " " + (l.description || "")).toLowerCase().includes(q)
    );
  }
  if (maxPrice) filtered = filtered.filter(l => Number(l.price) <= Number(maxPrice));
  if (bedrooms) filtered = filtered.filter(l => l.type === bedrooms);

  render(filtered);
});

loadListings();
