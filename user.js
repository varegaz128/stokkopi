// =====================================================
// 🔥 IMPORT FIREBASE
// =====================================================
import { db, ref, set, get, child } from "./firebase.js";

// =====================================================
// 🚀 INIT & LOADING SCREEN
// =====================================================
const loadingOverlay = document.getElementById("loadingOverlay");
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => loadingOverlay.classList.add("hidden"), 500);
  }
}

// =====================================================
// 🔒 AUTH LOGIC
// =====================================================
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const switchForm = document.getElementById("switchForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const regPinInput = document.getElementById("regPin");
const userRoleSelect = document.getElementById("userRole");

let isLoginMode = true;
let users = {}; // cache data user

// Jika sudah login → langsung redirect
const activeSession = localStorage.getItem("currentUser");
if (activeSession) {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.style.opacity = "1";
  }
  setTimeout(() => (window.location.href = "index.html"), 500);
}

// =====================================================
// 🧩 FUNGSI MUAT DATA USER DARI FIREBASE
// =====================================================
async function loadUsersFromFirebase() {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "users"));
    users = snapshot.exists() ? snapshot.val() : {};
    console.log("✅ Data user dimuat dari Firebase.");
  } catch (err) {
    console.error("❌ Gagal memuat user dari Firebase:", err);
    users = {};
  }
}

window.addEventListener("load", async () => {
  await loadUsersFromFirebase();
  setTimeout(hideLoading, 500);
});

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
    regPinInput.classList.toggle("hidden", isLoginMode);
    userRoleSelect.classList.toggle("hidden", isLoginMode);
  });
}

// =====================================================
// 🚀 LOGIN & REGISTER
// =====================================================
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Isi semua field dulu ya!");
      return;
    }

    // =========================
    // MODE LOGIN
    // =========================
    if (isLoginMode) {
      await loadUsersFromFirebase(); // pastikan ambil data terbaru
      const user = users[username];

      if (!user) {
        alert("❌ Username tidak ditemukan!");
        return;
      }

      if (user.password !== password) {
        alert("❌ Password salah!");
        return;
      }

      // Simpan hanya data sesi
      localStorage.setItem("currentUser", username);
      localStorage.setItem("currentRole", user.role);

      alert(
        `👋 Selamat datang, ${username}! (Role: ${user.role.toUpperCase()})`
      );
      loadingOverlay.classList.remove("hidden");
      loadingOverlay.style.opacity = "1";
      setTimeout(() => (window.location.href = "index.html"), 500);
      return;
    }

    // =========================
    // MODE REGISTER
    // =========================
    const REGISTRATION_PIN = "DISELL123";
    const pinInput = regPinInput.value.trim();
    const selectedRole = userRoleSelect.value;

    if (pinInput !== REGISTRATION_PIN) {
      alert("❌ PIN pendaftaran salah!");
      return;
    }

    if (users[username]) {
      alert("Username sudah digunakan! Silakan login.");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // 💥 Sekarang admin bisa lebih dari satu
    const finalRole = selectedRole;

    try {
      await set(ref(db, "users/" + username), {
        password: password,
        role: finalRole,
        createdAt: new Date().toISOString(),
      });

      alert(`✅ Registrasi berhasil!\nRole: ${finalRole.toUpperCase()}`);
      isLoginMode = true;
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      submitBtn.className = "primary-btn";
      switchForm.textContent = "Belum punya akun? Daftar";
      regPinInput.classList.add("hidden");
      userRoleSelect.classList.add("hidden");
      usernameInput.value = "";
      passwordInput.value = "";
      regPinInput.value = "";
    } catch (err) {
      console.error("❌ Gagal simpan ke Firebase:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  });
}
