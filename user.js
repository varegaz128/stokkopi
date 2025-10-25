const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const switchForm = document.getElementById("switchForm");

let isLoginMode = true;

// Ganti form login <-> register
switchForm.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  formTitle.textContent = isLoginMode ? "Login" : "Register";
  submitBtn.textContent = isLoginMode ? "Login" : "Register";
  switchForm.textContent = isLoginMode
    ? "Belum punya akun? Daftar"
    : "Sudah punya akun? Login";
});

submitBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Isi semua field dulu ya!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (isLoginMode) {
    // LOGIN
    if (users[username] && users[username].password === password) {
      localStorage.setItem("currentUser", username);
      alert(`Selamat datang, ${username}!`);
      window.location.href = "index.html"; // arahkan ke halaman utama
    } else {
      alert("Username atau password salah!");
    }
  } else {
    // REGISTER
    if (users[username]) {
      alert("Username sudah digunakan!");
      return;
    }

    users[username] = { password };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registrasi berhasil! Silakan login.");
    // balik ke mode login
    isLoginMode = true;
    formTitle.textContent = "Login";
    submitBtn.textContent = "Login";
    switchForm.textContent = "Belum punya akun? Daftar";
  }
});
