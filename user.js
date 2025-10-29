// =====================================================
// 🔥 IMPORT FIREBASE
// =====================================================
import { db, ref, set, get, child } from "./firebase.js";

// =====================================================
// 🚀 INIT & LOADING SCREEN LOGIC
// =====================================================
const loadingOverlay = document.getElementById("loadingOverlay");

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.classList.add("hidden");
    }, 500);
  }
}

// =====================================================
// 🔒 AUTH LOGIC & PIN
// =====================================================
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const switchForm = document.getElementById("switchForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const regPinInput = document.getElementById("regPin");
const userRoleSelect = document.getElementById("userRole");

let isLoginMode = true; // Mode awal: Login
let users = {}; // ⭐ BARU: Variabel global untuk menyimpan data user dari Firebase

// Cek apakah user sudah login
if (localStorage.getItem("currentUser")) {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.style.opacity = "1";
  }
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// ⭐ FUNGSI BARU: LOAD SEMUA USER DARI FIREBASE
async function loadUsersFromFirebase() {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users`));
    if (snapshot.exists()) {
      users = snapshot.val();
      console.log("✅ Data user berhasil dimuat dari Firebase.");
    } else {
      users = {}; // Kosong jika belum ada user
    }
  } catch (error) {
    console.error("❌ Gagal memuat user dari Firebase:", error); // Biarkan users kosong dan lanjutkan, login/register akan gagal jika koneksi putus
  }
}

// =====================================================
// 🚀 INIT DENGAN LOAD DATA
// =====================================================
window.addEventListener("load", async () => {
  // Tunggu data user dimuat sebelum menyembunyikan loading screen
  await loadUsersFromFirebase();
  setTimeout(hideLoading, 500); // Persingkat loading setelah data dimuat
});

// =====================================================
// 🔄 GANTI MODE LOGIN / REGISTER (TETAP)
// =====================================================
if (switchForm) {
  switchForm.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    formTitle.textContent = isLoginMode ? "Login" : "Register";
    submitBtn.textContent = isLoginMode ? "Login" : "Register";
    submitBtn.className = isLoginMode ? "primary-btn" : "success-btn";
    switchForm.textContent = isLoginMode
      ? "Belum punya akun? Daftar"
      : "Sudah punya akun? Login";

    usernameInput.value = "";
    passwordInput.value = "";

    if (isLoginMode) {
      regPinInput.classList.add("hidden");
      userRoleSelect.classList.add("hidden");
    } else {
      regPinInput.classList.remove("hidden");
      userRoleSelect.classList.remove("hidden");
    }
  });
}

// =====================================================
// 🧠 LOGIN & REGISTER (MODIFIKASI FIREBASE)
// =====================================================
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Isi semua field dulu ya!");
      return;
    } // ❌ HAPUS: const users = JSON.parse(localStorage.getItem("users") || "{}"); // ⭐ GUNAKAN VARIABEL GLOBAL 'users' YANG SUDAH DI-LOAD // === LOGIN MODE (MODIFIKASI FIREBASE) ===

    if (isLoginMode) {
      // ⭐ Gunakan data 'users' global yang sudah dimuat dari Firebase
      if (users[username] && users[username].password === password) {
        localStorage.setItem("currentUser", username);
        alert(
          `👋 Selamat datang, ${username}! (Role: ${users[
            username
          ].role.toUpperCase()})`
        );
        if (loadingOverlay) {
          loadingOverlay.classList.remove("hidden");
          loadingOverlay.style.opacity = "1";
        }
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      } else {
        alert("❌ Username atau password salah!");
      }
      return;
    } // === REGISTER MODE (MODIFIKASI FIREBASE) ===

    let selectedRole = userRoleSelect.value;
    const pinInput = regPinInput.value;

    if (users[username]) {
      alert("Username sudah digunakan! Silakan Login.");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    const REGISTRATION_PIN = "DISELL123";
    if (pinInput !== REGISTRATION_PIN) {
      alert("❌ PIN salah! Pendaftaran dibatalkan.");
      return;
    }
    // ❌ HAPUS: users[username] = { password, role: selectedRole }; // ❌ HAPUS: localStorage.setItem("users", JSON.stringify(users)); // Simpan ke Firebase

    try {
      await set(ref(db, "users/" + username), {
        // Hapus username jika kunci (path) sudah username
        password: password,
        role: finalRole,
        createdAt: new Date().toISOString(),
      });

      // ⭐ UPDATE VARIABEL GLOBAL setelah berhasil disimpan
      users[username] = { password, role: finalRole };

      alert(
        `✅ Registrasi berhasil!\nRole: ${finalRole.toUpperCase()}\nData tersimpan di Firebase.`
      ); // Balik ke mode login

      isLoginMode = true;
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      submitBtn.className = "primary-btn";
      switchForm.textContent = "Belum punya akun? Daftar";
      usernameInput.value = "";
      passwordInput.value = "";
      regPinInput.value = "";
      regPinInput.classList.add("hidden");
      userRoleSelect.classList.add("hidden");
    } catch (error) {
      console.error("❌ Gagal simpan ke Firebase:", error);
      alert("Terjadi kesalahan saat menyimpan ke Firebase.");
    }
  });
}
