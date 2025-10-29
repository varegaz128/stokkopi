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

window.addEventListener("load", () => {
  setTimeout(hideLoading, 2000);
});

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

// =====================================================
// 🔄 GANTI MODE LOGIN / REGISTER
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
// 🧠 LOGIN & REGISTER
// =====================================================
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Isi semua field dulu ya!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    // === LOGIN MODE ===
    if (isLoginMode) {
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
    }

    // === REGISTER MODE ===
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

    // Simpan ke LocalStorage (offline backup)
    users[username] = { password, role: selectedRole };
    localStorage.setItem("users", JSON.stringify(users));

    // Simpan ke Firebase
    try {
      await set(ref(db, "users/" + username), {
        username: username,
        password: password,
        role: selectedRole,
        createdAt: new Date().toISOString(),
      });

      alert(
        `✅ Registrasi berhasil!\nRole: ${selectedRole.toUpperCase()}\nData tersimpan di Firebase.`
      );

      // Balik ke mode login
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
