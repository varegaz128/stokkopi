// user.js

// =====================================================
// 🚀 INIT & LOADING SCREEN LOGIC
// =====================================================
const loadingOverlay = document.getElementById("loadingOverlay");

/**
 * Menyembunyikan loading screen dengan transisi opacity.
 */
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.classList.add("hidden");
    }, 500);
  }
}

// Tampilkan Loading Screen selama 2 detik saat halaman selesai dimuat
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
// Elemen baru untuk Register
const regPinInput = document.getElementById("regPin");
const userRoleSelect = document.getElementById("userRole");

let isLoginMode = true; // Mode awal: Login

// Cek apakah user sudah login saat dimuat
if (localStorage.getItem("currentUser")) {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.style.opacity = "1";
  }
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// -----------------------------------------------------
// Handler: Ganti form (Login <-> Register)
// -----------------------------------------------------
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

    // TAMPILKAN/SEMBUNYIKAN FIELD PIN & ROLE
    if (isLoginMode) {
      regPinInput.classList.add("hidden");
      userRoleSelect.classList.add("hidden");
    } else {
      regPinInput.classList.remove("hidden");
      userRoleSelect.classList.remove("hidden");
    }
  });
}

// -----------------------------------------------------
// Handler: Submit (Login atau Register)
// -----------------------------------------------------
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Isi semua field dulu ya!");
      return;
    }

    // Mengambil data user
    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (isLoginMode) {
      // === LOGIN LOGIC ===
      if (users[username] && users[username].password === password) {
        localStorage.setItem("currentUser", username);
        alert(
          `👋 Selamat datang, ${username}! (Role: ${users[
            username
          ].role.toUpperCase()})`
        );

        // Tampilkan loading dan redirect
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
    } else {
      // === REGISTER LOGIC ===
      const selectedRole = userRoleSelect.value;
      const pinInput = regPinInput.value;

      if (users[username]) {
        alert("Username sudah digunakan! Silakan Login.");
        return;
      }
      if (password.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
      }

      // 🔐 VALIDASI PIN REGISTRASI
      const REGISTRATION_PIN = "DISELL123"; // <-- ⚠️ PIN ANDA
      if (pinInput !== REGISTRATION_PIN) {
        alert("❌ PIN Pendaftaran salah! Pendaftaran dibatalkan.");
        return;
      }

      // LOGIC: Role Admin hanya bisa dipilih jika belum ada Admin lain.
      if (selectedRole === "admin") {
        const isAdminExists = Object.values(users).some(
          (u) => u.role === "admin"
        );
        if (isAdminExists) {
          alert(
            "⚠️ Role Admin sudah terdaftar! Akun ini akan didaftarkan sebagai User Biasa."
          );
          selectedRole = "user"; // Paksa ke user jika admin sudah ada
        }
      }

      // Simpan user baru dengan properti role
      users[username] = { password, role: selectedRole };
      localStorage.setItem("users", JSON.stringify(users));

      alert(
        `✅ Registrasi berhasil! Role: ${selectedRole.toUpperCase()}. Silakan login.`
      );

      // Balik otomatis ke mode login
      isLoginMode = true;
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      submitBtn.className = "primary-btn";
      switchForm.textContent = "Belum punya akun? Daftar";
      usernameInput.value = "";
      passwordInput.value = "";
      regPinInput.value = ""; // Bersihkan pin
      // Sembunyikan field tambahan lagi
      regPinInput.classList.add("hidden");
      userRoleSelect.classList.add("hidden");
    }
  });
}
import { db, ref, set, get, child, remove } from "./firebase.js";

console.log("✅ user.js aktif dan Firebase tersambung", db);
