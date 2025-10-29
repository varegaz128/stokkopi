// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// === KONFIGURASI FIREBASE LU ===
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

// === INISIALISASI APP & DATABASE ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === EXPORT BIAR BISA DIPAKAI DI FILE LAIN ===
export { db, ref, set, get, child, update, remove };
