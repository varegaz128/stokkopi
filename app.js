// app.js

// =====================================================
// 🔒 CEK LOGIN & AMBIL USER DATA
// =====================================================

const userDisplay = document.getElementById("userDisplay");
const userDisplayBtn = document.getElementById("userDisplayBtn");
const logoutPopup = document.getElementById("logoutPopup");
const confirmLogoutBtn = document.getElementById("confirmLogout");
const cancelLogoutBtn = document.getElementById("cancelLogout");

const currentUsername = localStorage.getItem("currentUser");
const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
const currentUserData = allUsers[currentUsername];

// Tentukan Role User Saat Ini
const currentUserRole = currentUserData ? currentUserData.role : null;

if (!currentUsername || !currentUserData) {
  // Jika tidak ada user atau data user, redirect ke halaman login
  window.location.href = "user.html";
} else {
  // Tampilkan nama user dan role di header
  if (userDisplay) {
    userDisplay.textContent = `${currentUsername} (${currentUserRole.toUpperCase()})`;
  }
}

// Event listener untuk tombol user (tampilkan popup logout)
if (userDisplayBtn) {
  userDisplayBtn.addEventListener("click", () => {
    logoutPopup.classList.remove("hidden");
  });
}

// Event listener untuk tombol konfirmasi logout
if (confirmLogoutBtn) {
  confirmLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("productions");
    localStorage.removeItem("histories");
    window.location.href = "user.html";
  });
}

// Event listener untuk tombol batal logout
if (cancelLogoutBtn) {
  cancelLogoutBtn.addEventListener("click", () => {
    logoutPopup.classList.add("hidden");
  });
}

// =====================================================
// 🧩 ELEMENT UTAMA
// =====================================================
const form = document.getElementById("addForm");
const menuSelect = document.getElementById("menu");
const qtyInput = document.getElementById("qty");
const productList = document.getElementById("productList");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const startScanBtn = document.getElementById("startScanBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const closeScanBtn = document.getElementById("closeScanBtn");
const readerDiv = document.getElementById("reader");
const scanResult = document.getElementById("scanResult");
const scanPopup = document.getElementById("scanPopup");

// Elements untuk Fix Kamera
const triggerCamBtn = document.getElementById("triggerCamBtn");
const cameraInfo = document.getElementById("cameraInfo");

// New elements for data management
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const uploadJsonInput = document.getElementById("uploadJsonInput");
const resetDataBtn = document.getElementById("resetDataBtn");
// app.js

// ... (Elements untuk data management sebelumnya)
const exportUserHistoryBtn = document.getElementById("exportUserHistoryBtn");

// !!! BARU: Elemen untuk Export User
const exportUserPopup = document.getElementById("exportUserPopup");
const closeExportUserPopup = document.getElementById("closeExportUserPopup");
const userSelectDropdown = document.getElementById("userSelectDropdown");
const confirmExportUserBtn = document.getElementById("confirmExportUserBtn");
const uniqueBarcodePopup = document.getElementById("uniqueBarcodePopup");
const closeUniqueBarcodeBtn = document.getElementById("closeUniqueBarcodeBtn");
const uniqueBarcodeContainer = document.getElementById(
  "uniqueBarcodeContainer"
);
const uniqueBarcodeTitle = document.getElementById("uniqueBarcodeTitle");
const uniqueBarcodeCode = document.getElementById("uniqueBarcodeCode");
const printUniqueBarcodeBtn = document.getElementById("printUniqueBarcodeBtn");

// =====================================================
// 📦 DATA PRODUKSI & HISTORI
// =====================================================
let productions = JSON.parse(localStorage.getItem("productions") || "[]");
let histories = JSON.parse(localStorage.getItem("histories") || "[]");

// =====================================================
// 🔒 IMPLEMENTASI BATASAN AKSES (ROLE-BASED)
// =====================================================
function applyAccessControl() {
  // ID element yang HANYA BOLEH DIAKSES ADMIN
  const adminOnlyElements = [
    document.getElementById("addForm"), // Form Input Produksi
    document.getElementById("toggleFormBtn"), // Tombol Tampilkan Form Input
    document.getElementById("historyBtnContainer"), // Kontainer Tombol Riwayat
    document.getElementById("dataManagementContainer"), // Kontainer Import/Export/Reset
  ];

  if (currentUserRole !== "admin") {
    adminOnlyElements.forEach((el) => {
      if (el) {
        el.classList.add("hidden");
      }
    }); // Pastikan tombol SCAN selalu terlihat untuk semua user

    if (startScanBtn) {
      startScanBtn.classList.remove("hidden");
    }
  }
}

// =====================================================
// 🧮 EVENT: TAMPIL / SEMBUNYIKAN FORM
// =====================================================
if (toggleFormBtn) {
  toggleFormBtn.addEventListener("click", () =>
    form.classList.toggle("hidden")
  );
}
document
  .getElementById("cancelAdd")
  ?.addEventListener("click", () => form.classList.add("hidden"));

// =====================================================
// 📜 LOG HISTORY
// =====================================================
function logHistory(data) {
  let histories = JSON.parse(localStorage.getItem("histories") || "[]");
  const now = new Date();

  histories.push({
    date: data.date,
    menu: data.menu,
    qty: data.qty,
    type: data.type,
    total: data.total,
    time: now.toLocaleString("id-ID"),
    user: currentUsername || "N/A",
  });

  localStorage.setItem("histories", JSON.stringify(histories)); // Hanya Admin yang perlu me-render history karena tombolnya disembunyikan

  if (currentUserRole === "admin") {
    renderHistory();
  }
}

// =====================================================
// ➕ TAMBAH PRODUK (DIBLOKIR JIKA BUKAN ADMIN)
// =====================================================
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentUserRole !== "admin") {
      alert("❌ Anda tidak memiliki izin untuk menambah stok produksi.");
      form.classList.add("hidden");
      return;
    }

    const menu = menuSelect.value;
    const qty = parseInt(qtyInput.value);
    if (!menu || !qty || qty <= 0) return alert("Lengkapi data dengan benar.");

    const now = new Date();
    const today = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;
    const code = `${menu}-${today}`;

    productions = JSON.parse(localStorage.getItem("productions") || "[]");

    const existing = productions.find(
      (p) => p.menu === menu && p.date === today
    );
    if (existing) existing.qty += qty;
    else productions.push({ menu, qty, date: today, code });

    const totalNew = existing ? existing.qty : qty;
    logHistory({ date: today, menu, qty, type: "Produksi", total: totalNew });

    localStorage.setItem("productions", JSON.stringify(productions));
    alert(`✅ ${menu} (${qty} pcs) ditambahkan!`);
    qtyInput.value = "";
    form.classList.add("hidden");
    renderProducts();
  });
}

// =====================================================
// 🧾 RENDER PRODUK (User Biasa: Hanya lihat barcode dan nama)
// =====================================================
function renderProducts() {
  const raw = localStorage.getItem("productions");
  productions = raw ? JSON.parse(raw) : [];

  const valid = productions.filter(
    (p) => p.menu && p.date && Number(p.qty) > 0
  );
  if (valid.length !== productions.length) {
    productions = valid;
    localStorage.setItem("productions", JSON.stringify(productions));
  }

  productList.innerHTML = ""; // Hapus class product-grid yang lama dan ganti ke list-container
  productList.classList.remove("product-grid");
  productList.classList.add("product-list-container");

  if (productions.length === 0) {
    productList.innerHTML = `<p style="text-align:center;color:#666">Belum ada stok ☕</p>`;
    return;
  }

  const grouped = {};
  productions.forEach((p) => {
    if (!grouped[p.menu]) grouped[p.menu] = [];
    grouped[p.menu].push(p);
  });

  Object.keys(grouped).forEach((menu) => {
    // Hitung total stok untuk tampilan ringkas
    const totalQty = grouped[menu].reduce((sum, p) => sum + p.qty, 0);

    const div = document.createElement("div"); // Gunakan product-item untuk kontainer luar
    div.classList.add("product-item");
    div.innerHTML = `
        <div class="product-card" data-menu="${menu}">
            <div class="product-img ${menu}"></div>
            <div class="card-content">
                <h3>${menu}</h3>
                <p>Total Stok: <strong style="color:var(--accent);">${totalQty}</strong> pcs</p>
            </div>
            <span class="card-arrow">▶</span>
        </div>
        <div class="product-details-wrapper">
                                    <div class="product-details" id="details-${menu}">
                            </div>
        </div>
    `;
    productList.appendChild(div); // !!! BARU: Event listener dipasang untuk tombol card (memicu slide-down)

    div.querySelector(".product-card").addEventListener("click", (e) => {
      // Mencegah klik saat tombol delete diklik
      if (e.target.closest(".date-row")?.querySelector(".delete-btn")) return;
      toggleTanggal(menu);
    });
  }); // Hapus Event listener lama (Print/Expand) karena sudah diganti dengan logika di atas

  document.querySelectorAll(".print-btn").forEach((btn) => {
    /* Logic dihapus */
  });
  document.querySelectorAll(".expand-btn").forEach((btn) => {
    /* Logic dihapus */
  });
}

// =====================================================
// 🗓️ TAMPILKAN TANGGAL PER MENU (MODIFIKASI: Slide-down Akordeon)
// =====================================================
function toggleTanggal(menu) {
  const details = document.getElementById(`details-${menu}`);
  const arrow = document.querySelector(
    `.product-card[data-menu="${menu}"] .card-arrow`
  );

  if (!details || !arrow) return;

  const data = productions
    .filter((p) => p.menu === menu)
    .sort((a, b) => {
      // Urutkan tanggal terbaru di atas
      const [d1, m1, y1] = a.date.split("/").map(Number);
      const [d2, m2, y2] = b.date.split("/").map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });

  const isOpen = details.classList.contains("open");

  // Tutup semua detail lain (accordion)
  document.querySelectorAll(".product-details.open").forEach((other) => {
    if (other !== details) {
      other.style.maxHeight = "0";
      other.classList.remove("open");
      other.style.marginTop = "0";
      const otherMenu = other.id.replace("details-", "");
      const otherArrow = document.querySelector(
        `.product-card[data-menu="${otherMenu}"] .card-arrow`
      );
      if (otherArrow) otherArrow.classList.remove("open");
    }
  });

  if (isOpen) {
    // Tutup detail saat ini
    details.style.maxHeight = "0";
    details.style.opacity = "0";
    details.style.marginTop = "0";
    arrow.classList.remove("open");
    setTimeout(() => details.classList.remove("open"), 250);
  } else {
    // Isi data
    details.innerHTML = data
      .map(
        (p) => `
        <div class="date-row" onclick="showUniqueBarcodePopup('${p.menu}', '${
          p.date
        }')">
          <div><strong>📅 ${p.date}</strong></div>
          <div style="display: flex; align-items: center;">
            <span class="stock-qty">Stok: ${p.qty}</span>
            ${
              currentUserRole === "admin"
                ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteProduct('${p.menu}','${p.date}')">🗑️</button>`
                : ""
            }
          </div>
        </div>
      `
      )
      .join("");

    // Tampilkan animasi halus
    details.classList.add("open");
    arrow.classList.add("open");

    // Reset dulu biar animasi halus
    details.style.transition = "none";
    details.style.maxHeight = "0";
    details.style.opacity = "0";
    details.style.marginTop = "0";
    requestAnimationFrame(() => {
      details.style.transition =
        "max-height 0.3s ease, opacity 0.3s ease, margin-top 0.2s ease";
      details.style.maxHeight = details.scrollHeight + 10 + "px";
      details.style.opacity = "1";
      details.style.marginTop = "4px"; // nempel tapi tetap ada jarak tipis
    });
  }
}

// =====================================================
// 🧾 UPDATE BARCODE (DIBLOKIR JIKA BUKAN ADMIN)
// =====================================================
// !!! FUNGSI INI DIBIARKAN KARENA ADA DI KODE ASLI ANDA
function updateBarcode(menu, date) {
  if (currentUserRole !== "admin") {
    return alert("❌ Anda tidak memiliki izin untuk mengubah barcode.");
  }
  const el = document.getElementById(`barcode-${menu}`);
  el.innerHTML = "";
  new QRCode(el, {
    text: `${menu}-${date}`,
    width: 140,
    height: 140,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

// =====================================================
// 🗑️ HAPUS PRODUK (MODIFIKASI: Tambah Log History)
// =====================================================
function deleteProduct(menu, date) {
  if (currentUserRole !== "admin") {
    return alert("❌ Anda tidak memiliki izin untuk menghapus produk.");
  }
  if (!confirm(`Hapus stok ${menu} (${date}) ?`)) return;

  const itemToDelete = productions.find(
    (p) => p.menu === menu && p.date === date
  );

  productions = productions.filter(
    (p) => !(p.menu === menu && p.date === date)
  );
  localStorage.setItem("productions", JSON.stringify(productions));
  if (itemToDelete) {
    logHistory({
      date: date,
      menu: menu,
      qty: itemToDelete.qty,
      type: "Hapus Stok",
      total: 0,
    });
  }

  renderProducts();
}

// =====================================================
// 🖨️ PRINT BARCODE (MODIFIKASI: Hanya Admin, hanya print kode unik)
// =====================================================
function printBarcode(menu, date) {
  if (currentUserRole !== "admin") {
    return alert("❌ Anda tidak memiliki izin untuk mencetak barcode.");
  } // Pastikan date ada saat mencetak dari popup unik
  if (!date) return alert("Kode unik per tanggal diperlukan untuk mencetak!");
  const code = `${menu}-${date}`;
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Print ${menu}</title>
    <style>
      body{font-family:sans-serif;text-align:center;padding:20px;margin:0;}
      .label{display:inline-block;border:1px solid #ddd;padding:15px;border-radius:10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);}
      .logo{font-weight:800;color:#d12a08;font-size:20px; margin-bottom: 5px;}
      .menu{font-size:18px;margin-top:5px; font-weight: 600;}
      .date{font-size:14px;color:#666;margin-bottom:10px;}
    </style>
    </head><body>
      <div class="label">
        <div class="logo">DISELL COFFEE</div>
        <div class="menu">${menu}</div>
        <div class="date">${date}</div>
        <div id="qrcode"></div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
      <script>
        new QRCode(document.getElementById('qrcode'), {
          text: "${code}",
          width: 250, height: 250,
          colorDark:'#000', colorLight:'#fff',
          correctLevel: QRCode.CorrectLevel.H
        });
        window.onload = () => { 
            setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
            }, 500);
        };
      </script>
    </body></html>
  `);
  w.document.close(); // Tutup popup setelah print dipicu
  uniqueBarcodePopup.classList.add("hidden");
}

// =====================================================
// 🔑 POPUP BARCODE UNIK PER TANGGAL (NEW LOGIC)
// =====================================================
if (closeUniqueBarcodeBtn) {
  closeUniqueBarcodeBtn.addEventListener("click", () => {
    uniqueBarcodePopup.classList.add("hidden");
  });
}

function showUniqueBarcodePopup(menu, date) {
  // Dipanggil saat date-row di slide-down diklik
  const code = `${menu}-${date}`;

  uniqueBarcodeTitle.textContent = `${menu} (${date})`;
  uniqueBarcodeCode.textContent = code;
  uniqueBarcodeContainer.innerHTML = ""; // Clear previous QR

  new QRCode(uniqueBarcodeContainer, {
    text: code,
    width: 250,
    height: 250,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  if (currentUserRole === "admin") {
    printUniqueBarcodeBtn.classList.remove("hidden");
    // Kloning tombol untuk mengganti listener lama
    const newPrintBtn = printUniqueBarcodeBtn.cloneNode(true);
    printUniqueBarcodeBtn.parentNode.replaceChild(
      newPrintBtn,
      printUniqueBarcodeBtn
    );
    // Pastikan event listener memanggil printBarcode dengan 2 argumen (menu, date)
    newPrintBtn.addEventListener("click", () => printBarcode(menu, date));
  } else {
    printUniqueBarcodeBtn.classList.add("hidden");
  }

  uniqueBarcodePopup.classList.remove("hidden");
}
function showUniqueBarcodePopup(menu, date) {
  const code = `${menu}-${date}`;

  // Set judul dan kode
  uniqueBarcodeTitle.textContent = `${menu} (${date})`;
  uniqueBarcodeCode.textContent = code;

  // Bersihkan QR lama, render ulang dari code tetap
  uniqueBarcodeContainer.innerHTML = "";
  new QRCode(uniqueBarcodeContainer, {
    text: code,
    width: 250,
    height: 250,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Hak akses print khusus admin
  if (currentUserRole === "admin") {
    printUniqueBarcodeBtn.classList.remove("hidden");

    // 🧠 Bersihin event listener lama (kalau ada)
    const newBtn = printUniqueBarcodeBtn;
    newBtn.replaceWith(newBtn.cloneNode(true));

    // Re-assign listener ke tombol yang baru
    const updatedPrintBtn = document.getElementById("printUniqueBarcodeBtn");
    updatedPrintBtn.addEventListener("click", () => printBarcode(menu, date));
  } else {
    printUniqueBarcodeBtn.classList.add("hidden");
  }

  // Tampilkan popup
  uniqueBarcodePopup.classList.remove("hidden");
}

// =====================================================
// 📸 SCAN QR (Futuristik & Fix Kamera) (TIDAK BERUBAH)
// =====================================================
let html5QrCode;

// ------------------------------------------------------------------
// 1. Tombol 'Start Scan' Hanya Tampilkan Popup
// ------------------------------------------------------------------
if (startScanBtn) {
  startScanBtn.addEventListener("click", () => {
    scanPopup.classList.remove("hidden");
    scanResult.textContent = "Menunggu aktivasi kamera...";
    readerDiv.innerHTML = ""; // Pastikan tombol trigger dan info ditampilkan di awal
    cameraInfo.classList.remove("hidden");
    triggerCamBtn.classList.remove("hidden");
    triggerCamBtn.textContent = "Mulai Kamera Sekarang";
    triggerCamBtn.disabled = false; // Hapus style background hitam sementara agar terlihat transparan jika berhasil
    readerDiv.style.backgroundColor = "transparent";
  });
}

// ------------------------------------------------------------------
// 2. Tombol 'Mulai Kamera Sekarang' yang memicu izin
// ------------------------------------------------------------------
if (triggerCamBtn) {
  triggerCamBtn.addEventListener("click", async () => {
    // Ganti teks tombol saat mencoba menyalakan
    triggerCamBtn.textContent = "Memuat...";
    triggerCamBtn.disabled = true;

    readerDiv.innerHTML = "";
    html5QrCode = new Html5Qrcode("reader");

    try {
      await html5QrCode.start(
        { facingMode: "environment" }, // Menggunakan kamera depan
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScan(decodedText),
        (errorMessage) => {
          console.warn("Scan error: ", errorMessage);
        }
      ); // Jika BERHASIL: Sembunyikan tombol trigger

      cameraInfo.classList.add("hidden");
      scanResult.textContent = "Kamera aktif. Arahkan ke barcode.";
      readerDiv.style.backgroundColor = "transparent";
    } catch (err) {
      // Jika GAGAL: Tampilkan pesan error
      const errMsg = err.message || "Unknown error";

      scanResult.textContent =
        "❌ Gagal mengakses kamera. Silakan cek izin browser.";

      alert(`
              ❌ GAGAL AKSES KAMERA! 
              
              Penyebab utama: Izin akses ditolak atau perangkat tidak ditemukan.
              
              **SOLUSI: Pastikan Anda menjalankan di 'http://localhost' dan secara manual atur izin kamera di pengaturan browser (ikon gembok/kamera).**
              
              Detail Error Teknis: ${errMsg}
            `); // Kembalikan tombol ke keadaan semula

      triggerCamBtn.textContent = "Mulai Kamera Sekarang";
      triggerCamBtn.disabled = false;
    }
  });
}

async function handleScan(decodedText) {
  productions = JSON.parse(localStorage.getItem("productions") || "[]");

  const found = productions.find((p) => `${p.menu}-${p.date}` === decodedText); // Hentikan scan segera setelah ditemukan

  if (html5QrCode) await html5QrCode.stop().catch(() => {});

  readerDiv.innerHTML = "";
  scanPopup.classList.add("hidden");

  if (!found) return alert("❌ Barcode tidak ditemukan di data produksi!"); // Popup interaktif stok (Futuristik)

  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
    <div class="popup-content futuristic-popup">
      <h3>📦 ${found.menu}</h3>
      <p><b>Tanggal Produksi:</b> <span class="futuristic-data">${found.date}</span></p>
      <p><b>Stok Saat Ini:</b> <span id="stok-val" class="futuristic-data">${found.qty}</span></p>

      <div style="margin-top:20px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
        <button id="masukBtn" class="futuristic-btn success-btn">⬆️ Barang Masuk</button>
        <button id="keluarBtn" class="futuristic-btn danger-btn">⬇️ Barang Keluar</button>
      </div>
      <button id="tutupBtn" class="futuristic-btn secondary-btn" style="margin-top: 10px;">Tutup</button>
    </div>
  `;
  document.body.appendChild(popup); // Barang Masuk

  popup.querySelector("#masukBtn").addEventListener("click", () => {
    const masuk = prompt("Masukkan jumlah barang masuk:", "1");
    const jumlah = parseInt(masuk);
    if (!jumlah || jumlah <= 0) return alert("Jumlah tidak valid.");

    found.qty += jumlah;
    updateStock(found, "Masuk", jumlah);
    popup.querySelector("#stok-val").textContent = found.qty;
    alert(`✅ ${jumlah} ${found.menu} masuk. Total: ${found.qty}`);
    popup.remove();
  }); // Barang Keluar

  popup.querySelector("#keluarBtn").addEventListener("click", () => {
    const keluar = prompt("Masukkan jumlah barang keluar:", "1");
    const jumlah = parseInt(keluar);
    if (!jumlah || jumlah <= 0) return alert("Jumlah tidak valid.");
    if (jumlah > found.qty) return alert("Stok tidak cukup!");

    found.qty -= jumlah;
    updateStock(found, "Keluar", jumlah);
    popup.querySelector("#stok-val").textContent = found.qty;
    alert(`✅ ${jumlah} ${found.menu} keluar. Sisa: ${found.qty}`);
    popup.remove();
  }); // Tutup popup

  popup.querySelector("#tutupBtn").addEventListener("click", () => {
    popup.remove();
  });
}

// =====================================================
// 🔁 UPDATE STOK + HISTORY
// =====================================================
function updateStock(item, type, jumlah) {
  // Hanya Admin dan User yang boleh melakukan update ini
  if (!["admin", "user"].includes(currentUserRole)) {
    return alert("❌ Anda tidak memiliki izin untuk memodifikasi stok.");
  }

  productions = JSON.parse(localStorage.getItem("productions") || "[]");

  const idx = productions.findIndex(
    (p) => p.menu === item.menu && p.date === item.date
  );
  if (idx >= 0) productions[idx] = item;

  localStorage.setItem("productions", JSON.stringify(productions));

  logHistory({
    date: item.date,
    menu: item.menu,
    qty: jumlah,
    type,
    total: item.qty,
  });

  renderProducts();
}

// =====================================================
// 📋 RENDER HISTORI (Hanya Admin yang melihat via tombol)
// =====================================================
function renderHistory() {
  const tableBody = document.querySelector("#historyTable tbody");
  if (!tableBody || currentUserRole !== "admin") return; // Hanya render jika admin

  histories = JSON.parse(localStorage.getItem("histories") || "[]");

  tableBody.innerHTML = "";

  const filteredHistories = histories;

  tableBody.innerHTML = filteredHistories
    .map(
      (h) => `
      <tr>
        <td>${h.date}</td>
        <td>${h.menu}</td>
        <td style="color: ${
        h.type === "Keluar" ? "#d12a08" : "#4caf50"
      }; font-weight: 600;">${h.qty}</td>
        <td>${h.type}</td>
        <td>${h.total}</td>
        <td>${h.time}</td>
        <td>${h.user || "N/A"}</td>
      </tr>`
    )
    .join("");

  const tableHead = document.querySelector("#historyTable thead tr");
  if (tableHead) {
    tableHead.innerHTML = `
          <th>Tgl Produksi</th>
          <th>Menu</th>
          <th>Jumlah</th>
          <th>Jenis</th>
          <th>Total Stok</th>
          <th>Waktu Interaksi</th>
          <th>User</th> `;
  }
}

// =====================================================
// 🧹 STOP & CLOSE SCAN
// =====================================================
const stopScanHandler = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch (e) {
      console.error("Gagal menghentikan kamera:", e);
    }
  }
  readerDiv.innerHTML = "";
  scanPopup.classList.add("hidden");
};

if (stopScanBtn) {
  stopScanBtn.addEventListener("click", stopScanHandler);
}

if (closeScanBtn) {
  closeScanBtn.addEventListener("click", stopScanHandler);
}

// =====================================================
// 🚀 INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderHistory(); // Hanya akan dieksekusi jika admin
  applyAccessControl(); // Terapkan batasan akses saat inisialisasi
  // Expose functions to global scope for 'onclick' attributes
  window.showUniqueBarcodePopup = showUniqueBarcodePopup;
  window.deleteProduct = deleteProduct;
  window.printBarcode = printBarcode;
});

// =====================================================
// 📜 POPUP RIWAYAT BARANG KELUAR (Hanya bisa diakses Admin)
// =====================================================
const showHistoryBtn = document.getElementById("showHistoryBtn");
const historyPopup = document.getElementById("historyPopup");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const closePopupHistory = document.getElementById("closePopupHistory");

// Tampilkan popup
if (showHistoryBtn) {
  showHistoryBtn.addEventListener("click", () => {
    if (currentUserRole !== "admin") return;
    historyPopup.classList.remove("hidden");
    renderHistory();
  });
}

// Tutup popup
[closeHistoryBtn, closePopupHistory].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      historyPopup.classList.add("hidden");
    });
  }
});

// =====================================================
// 📄 EXPORT PDF (DIBLOKIR JIKA BUKAN ADMIN)
// =====================================================
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", () => {
    if (currentUserRole !== "admin")
      return alert("❌ Anda tidak memiliki izin untuk Export Data.");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("l", "pt", "a4");

    pdf.text("Riwayat Interaksi Stok - DISELL Coffee", 40, 40);
    html2canvas(document.querySelector("#historyTable")).then((canvas) => {
      const img = canvas.toDataURL("image/png");
      const width = 800;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(img, "PNG", 40, 60, width, height);
      pdf.save("riwayat-interaksi-stok.pdf");
    });
  });
}

// app.js

// ... (Kode untuk Import JSON dan Reset Data sebelumnya)

// =====================================================
// 📊 EXPORT EXCEL PER USER (FUNGSI INTI)
// =====================================================
function exportUserHistory(username) {
  if (currentUserRole !== "admin") {
    return alert("❌ Anda tidak memiliki izin untuk Export Data.");
  }

  // Ambil data riwayat
  const allHistories = JSON.parse(localStorage.getItem("histories") || "[]");

  // Filter riwayat hanya untuk user tertentu (perbandingan case-insensitive)
  const userHistories = allHistories.filter(
    (h) => h.user && h.user.toLowerCase() === username.toLowerCase()
  );

  if (userHistories.length === 0) {
    return alert(
      `Tidak ada riwayat interaksi yang ditemukan untuk user: ${username}`
    );
  }

  // Export ke Excel
  const ws = XLSX.utils.json_to_sheet(userHistories);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Riwayat_${username}`);
  XLSX.writeFile(wb, `riwayat-interaksi-${username}.xlsx`);
  alert(`✅ Riwayat interaksi untuk user ${username} berhasil diexport.`);
}

// =====================================================
// 🔑 POPUP PILIH USER UNTUK EXPORT (TAMPILKAN POPUP & ISI DROPDOWN)
// =====================================================
function openExportUserPopup() {
  if (currentUserRole !== "admin") {
    return alert("❌ Anda tidak memiliki izin untuk Export Data.");
  }

  if (!exportUserPopup || !userSelectDropdown) {
    console.error("Elemen Export User Popup tidak ditemukan di DOM.");
    return;
  }

  // 1. Ambil semua user dari LocalStorage
  const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
  // Filter user yang memiliki role terdaftar
  const usernames = Object.keys(allUsers).filter((name) => allUsers[name].role);

  userSelectDropdown.innerHTML = "";

  // Tambahkan opsi default
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--- Pilih User ---";
  userSelectDropdown.appendChild(defaultOption);

  // 2. Isi dropdown
  usernames.forEach((username) => {
    const option = document.createElement("option");
    option.value = username;
    option.textContent = `${username} (${allUsers[
      username
    ].role.toUpperCase()})`;
    userSelectDropdown.appendChild(option);
  });

  // 3. Tampilkan popup
  exportUserPopup.classList.remove("hidden");
}

// =====================================================
// 📊 EXPORT RIWAYAT PER USER (EVENT LISTENERS)
// =====================================================

// 1. Tombol Utama (Membuka Popup)
if (exportUserHistoryBtn) {
  exportUserHistoryBtn.addEventListener("click", () => {
    if (currentUserRole !== "admin") {
      return alert("❌ Anda tidak memiliki izin untuk Export Data.");
    }
    openExportUserPopup();
  });
}

// 2. Tombol Tutup Popup
if (closeExportUserPopup) {
  closeExportUserPopup.addEventListener("click", () => {
    exportUserPopup.classList.add("hidden");
  });
}

// 3. Tombol Konfirmasi Export di Popup
if (confirmExportUserBtn) {
  confirmExportUserBtn.addEventListener("click", () => {
    // Pengecekan akses ganda
    if (currentUserRole !== "admin") {
      exportUserPopup.classList.add("hidden");
      return alert("❌ Anda tidak memiliki izin untuk Export Data.");
    }

    const selectedUsername = userSelectDropdown.value;

    if (!selectedUsername) {
      return alert("Silakan pilih salah satu user yang terdaftar.");
    }

    // Panggil fungsi export
    exportUserHistory(selectedUsername);

    // Tutup popup setelah export
    exportUserPopup.classList.add("hidden");
  });
}

// =====================================================
// 📥 DATA IMPORT/EXPORT JSON & RESET (LANJUTAN CODE ANDA)
// =====================================================
// Catatan: Blok di bawah ini harus tetap dipertahankan
if (uploadJsonInput) {
  uploadJsonInput.addEventListener("change", (e) => {
    // ... (Logika upload JSON)
  });
}

if (resetDataBtn) {
  resetDataBtn.addEventListener("click", () => {
    // ... (Logika reset data)
  });
}
// =====================================================
// 📥 DATA IMPORT/EXPORT JSON & RESET (DIBLOKIR JIKA BUKAN ADMIN)
// =====================================================
if (downloadJsonBtn) {
  downloadJsonBtn.addEventListener("click", () => {
    if (currentUserRole !== "admin")
      return alert("❌ Anda tidak memiliki izin untuk Export Data.");
    const data = {
      users: JSON.parse(localStorage.getItem("users") || "{}"),
      productions: JSON.parse(localStorage.getItem("productions") || "[]"),
      histories: JSON.parse(localStorage.getItem("histories") || "[]"),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dissell_coffee_backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

if (uploadJsonInput) {
  uploadJsonInput.addEventListener("change", (e) => {
    if (currentUserRole !== "admin")
      return alert("❌ Anda tidak memiliki izin untuk Import Data.");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (
          confirm("Yakin ingin menimpa data saat ini dengan data dari file?")
        ) {
          if (data.users)
            localStorage.setItem("users", JSON.stringify(data.users));
          if (data.productions)
            localStorage.setItem(
              "productions",
              JSON.stringify(data.productions)
            );
          if (data.histories)
            localStorage.setItem("histories", JSON.stringify(data.histories));
          alert("✅ Data berhasil diimpor! Halaman akan dimuat ulang.");
          window.location.reload();
        }
      } catch (err) {
        alert(
          "❌ Gagal memproses file. Pastikan itu adalah file JSON yang valid."
        );
      }
    };
    reader.readAsText(file);
  });
}

if (resetDataBtn) {
  resetDataBtn.addEventListener("click", () => {
    if (currentUserRole !== "admin")
      return alert("❌ Anda tidak memiliki izin untuk Reset Data.");
    if (
      confirm(
        "⚠️ PERINGATAN! Ini akan menghapus SEMUA data produksi dan riwayat. Lanjutkan?"
      )
    ) {
      localStorage.removeItem("productions");
      localStorage.removeItem("histories");
      alert("✅ Data produksi dan riwayat berhasil dihapus.");
      renderProducts();
      renderHistory();
    }
  });
}
