// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBG2VXEAEyFRhVEjO6Bq7-R4odHcXC5Cd4",
  authDomain: "dissell-coffee-inventory.firebaseapp.com",
  databaseURL:
    "https://dissell-coffee-inventory-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dissell-coffee-inventory",
  storageBucket: "dissell-coffee-inventory.firebasestorage.app",
  messagingSenderId: "70690883699",
  appId: "1:70690883699:web:449acb3719c8c85c5d0206",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Export ke modul lain
export { db, ref, set, get, child, remove };
