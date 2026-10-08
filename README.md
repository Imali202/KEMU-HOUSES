# Nyumba — student housing finder for KeMU, Meru

A simple website where landlords/agents post rooms and apartments,
and students browse and search them. No app to install, no Claude
branding anywhere — this is a plain website you own outright.

**How it works:** the pages (HTML/CSS/JS) are static files that run
in the visitor's browser. All the "backend" — accounts, and the
listings database — is handled by **Firebase**, a free Google service.
You don't need to run or pay for a server.

Total setup time: about 15–20 minutes, done once.

---

## Step 1 — Create your free Firebase project

1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project**, name it something like `nyumba-kemu`, and finish the wizard (you can turn off Google Analytics — not needed).
3. In the left sidebar, click the **Build > Authentication** menu, click **Get started**, choose **Email/Password**, and enable it.
4. Click **Build > Firestore Database**, click **Create database**, choose a location close to Kenya (e.g. `eur3 (europe-west)`), and start in **production mode**.
5. Click the gear icon next to "Project Overview" → **Project settings**. Scroll to "Your apps", click the **</>** (web) icon, give it a nickname (e.g. "nyumba-web"), and click **Register app**. Firebase will show you a code block with a `firebaseConfig = {...}` object.
6. Copy those values into `js/firebase-config.js` in this project, replacing the placeholder text (e.g. `PASTE_YOUR_API_KEY_HERE`). Save the file.

## Step 2 — Set the security rules

This controls who can read/write what — without it, anyone could edit anyone else's listings.

1. In Firebase Console, go to **Firestore Database > Rules**.
2. Delete what's there and paste in the contents of `firestore.rules` (included in this project).
3. Click **Publish**.

## Step 3 — Try it locally

You can't just double-click `index.html` — browsers block some Firebase features on `file://` pages. Instead, run a tiny local server:

- If you have Python installed: open a terminal in this folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000` in your browser.
- Or, in VS Code, install the "Live Server" extension and click "Go Live".

Try signing up as a landlord, posting a listing, and viewing it on the homepage.

## Step 4 — Put it online (free)

The easiest option for a beginner is **Netlify**:

1. Go to https://app.netlify.com, sign up free.
2. Drag and drop this whole project folder onto the Netlify dashboard ("Deploy manually" / drag-and-drop area).
3. Netlify gives you a live URL immediately (e.g. `nyumba-kemu.netlify.app`), which you can share with people. You can later add a custom domain if you want.

(Alternative: Firebase Hosting also works well and keeps everything in one place — ask if you'd like those steps too.)

## Notes on this MVP

- **Photos:** to keep setup simple (and free, with no billing card needed), landlords paste photo links instead of uploading files directly. A landlord can upload a photo to a free host like https://imgur.com and paste the resulting link into the "Photo links" field when posting. If you outgrow this later, Firebase Storage can do direct uploads — worth adding once you have real users.
- **Roles:** anyone who signs up becomes a "landlord" who can post. If you later want to let students save favourites too, that's a small addition.
- **Costs:** Firebase's free tier comfortably covers an MVP with normal traffic. You'd only need to add billing if you get serious scale.

## Project structure

```
index.html        Homepage — browse & search listings
listing.html       Single listing detail page
login.html         Landlord login
signup.html        Landlord signup
dashboard.html      Landlord's own listings — post / edit / delete
css/style.css       All styling
js/firebase-config.js   Your Firebase keys go here
js/nav.js               Shared top navigation
js/app.js                Homepage logic
js/listing.js             Listing detail logic
js/auth-login.js          Login logic
js/auth-signup.js         Signup logic
js/dashboard.js            Dashboard (post/edit/delete) logic
firestore.rules      Security rules — paste into Firebase Console
```

## If something doesn't work

- Blank listings / errors on the homepage: almost always means `js/firebase-config.js` still has placeholder text, or the Firestore rules haven't been published yet.
- "Missing or insufficient permissions": check Step 2 — the rules probably weren't published.
- Nothing loads at all: make sure you're viewing the site through a local server or Netlify URL, not by double-clicking the HTML file.
