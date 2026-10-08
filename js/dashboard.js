import { auth, db } from "./firebase-config.js";
import { renderNav } from "./nav.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

renderNav();

const signedOutNotice = document.getElementById("signed-out-notice");
const dashContent = document.getElementById("dash-content");
const welcomeLine = document.getElementById("welcome-line");
const myListingsEl = document.getElementById("my-listings");
const form = document.getElementById("listing-form");
const postMsg = document.getElementById("post-msg");
const submitBtn = document.getElementById("submit-btn");
const editIdField = document.getElementById("edit-id");
const detailsEl = document.getElementById("post-form-details");

let currentUser = null;

function money(n) { return "KES " + Number(n).toLocaleString(); }

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    signedOutNotice.style.display = "block";
    dashContent.style.display = "none";
    return;
  }
  currentUser = user;
  signedOutNotice.style.display = "none";
  dashContent.style.display = "block";

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists() ? userDoc.data().name : user.email;
    welcomeLine.textContent = `Logged in as ${name}`;
  } catch {
    welcomeLine.textContent = `Logged in as ${user.email}`;
  }

  loadMyListings();
});

async function loadMyListings() {
  myListingsEl.innerHTML = "<p>Loading…</p>";
  try {
    const q = query(
      collection(db, "listings"),
      where("landlordId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const listings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (listings.length === 0) {
      myListingsEl.innerHTML = `<div class="empty-state"><h3>No listings yet</h3><p>Use "+ Post a new listing" above to add your first one.</p></div>`;
      return;
    }

    myListingsEl.innerHTML = listings.map(l => `
      <div class="my-listing-row">
        <img class="thumb-sm" src="${(l.images && l.images[0]) || ''}" alt="">
        <div>
          <strong>${l.title}</strong><br>
          <span style="color:var(--ink-soft); font-size:0.9rem">${money(l.price)}/mo · ${l.location}</span>
        </div>
        <div class="row-actions">
          <a href="listing.html?id=${l.id}" class="btn btn-outline" target="_blank">View</a>
          <button class="btn btn-outline" data-edit="${l.id}">Edit</button>
          <button class="btn btn-danger" data-delete="${l.id}">Delete</button>
        </div>
      </div>
    `).join("");

    myListingsEl.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => startEdit(listings.find(l => l.id === btn.dataset.edit)));
    });
    myListingsEl.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => removeListing(btn.dataset.delete));
    });
  } catch (err) {
    console.error(err);
    myListingsEl.innerHTML = `<p>Couldn't load your listings. (${err.message})</p>`;
  }
}

function startEdit(listing) {
  editIdField.value = listing.id;
  document.getElementById("title").value = listing.title || "";
  document.getElementById("price").value = listing.price || "";
  document.getElementById("type").value = listing.type || "bedsitter";
  document.getElementById("location").value = listing.location || "";
  document.getElementById("distance").value = listing.distance || "";
  document.getElementById("description").value = listing.description || "";
  document.getElementById("images").value = (listing.images || []).join(", ");
  document.getElementById("contactPhone").value = listing.contactPhone || "";
  submitBtn.textContent = "Save changes";
  detailsEl.open = true;
  detailsEl.scrollIntoView({ behavior: "smooth" });
}

async function removeListing(id) {
  if (!confirm("Delete this listing? This can't be undone.")) return;
  try {
    await deleteDoc(doc(db, "listings", id));
    loadMyListings();
  } catch (err) {
    alert("Couldn't delete: " + err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  postMsg.className = "form-msg";

  const images = document.getElementById("images").value
    .split(",").map(s => s.trim()).filter(Boolean);

  const data = {
    title: document.getElementById("title").value.trim(),
    price: Number(document.getElementById("price").value),
    type: document.getElementById("type").value,
    location: document.getElementById("location").value.trim(),
    distance: document.getElementById("distance").value.trim(),
    description: document.getElementById("description").value.trim(),
    images,
    contactPhone: document.getElementById("contactPhone").value.trim(),
    landlordId: currentUser.uid,
    landlordName: welcomeLine.textContent.replace("Logged in as ", ""),
    status: "active"
  };

  try {
    const editId = editIdField.value;
    if (editId) {
      await updateDoc(doc(db, "listings", editId), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "listings"), data);
    }
    postMsg.className = "form-msg success";
    postMsg.textContent = "Saved.";
    form.reset();
    editIdField.value = "";
    submitBtn.textContent = "Post listing";
    detailsEl.open = false;
    loadMyListings();
  } catch (err) {
    console.error(err);
    postMsg.className = "form-msg error";
    postMsg.textContent = "Couldn't save: " + err.message;
  }
});
