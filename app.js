// =====================================================
// 🔒 CEK LOGIN
// =====================================================
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  window.location.href = "user.html";
}

// 👋 Tampilkan nama user di header
const userDisplay = document.getElementById("userDisplay");
if (userDisplay && currentUser) {
  userDisplay.textContent = currentUser;
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
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const uploadJsonInput = document.getElementById("uploadJsonInput");
const resetDataBtn = document.getElementById("resetDataBtn");
const printAllBtn = document.getElementById("printAllBtn");
const scanPopup = document.getElementById("scanPopup");

// =====================================================
// 📦 DATA PRODUKSI & HISTORI
// =====================================================
let productions = JSON.parse(localStorage.getItem("productions") || "[]");
let histories = JSON.parse(localStorage.getItem("histories") || "[]");

// =====================================================
// 🧮 EVENT: TAMPIL / SEMBUNYIKAN FORM
// =====================================================
toggleFormBtn.addEventListener("click", () => form.classList.toggle("hidden"));
document
  .getElementById("cancelAdd")
  ?.addEventListener("click", () => form.classList.add("hidden"));

// =====================================================
// ➕ TAMBAH PRODUK
// =====================================================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const menu = menuSelect.value;
  const qty = parseInt(qtyInput.value);
  if (!menu || !qty || qty <= 0) return alert("Lengkapi data dengan benar.");

  const now = new Date();
  const today = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const code = `${menu}-${today}`;

  productions = JSON.parse(localStorage.getItem("productions") || "[]");

  const existing = productions.find((p) => p.menu === menu && p.date === today);
  if (existing) existing.qty += qty;
  else productions.push({ menu, qty, date: today, code });

  localStorage.setItem("productions", JSON.stringify(productions));
  alert(`✅ ${menu} (${qty} pcs) ditambahkan!`);
  qtyInput.value = "";
  form.classList.add("hidden");
  renderProducts();
});

// =====================================================
// 🧾 RENDER PRODUK
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

  productList.innerHTML = "";
  productList.classList.add("product-grid");

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
    const div = document.createElement("div");
    div.classList.add("product-card");
    div.innerHTML = `
      <div class="product-img ${menu}"></div>
      <h3>${menu}</h3>
      <div class="barcode-container" id="barcode-${menu}"></div>
      <button class="print-btn" data-menu="${menu}">🖨️ Print Barcode</button>
      <button class="expand-btn" data-menu="${menu}">Lihat Tanggal</button>
      <div class="info hidden" id="info-${menu}"></div>
    `;
    productList.appendChild(div);

    const barcodeEl = document.getElementById(`barcode-${menu}`);
    barcodeEl.innerHTML = "";
    new QRCode(barcodeEl, {
      text: menu,
      width: 140,
      height: 140,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  });

  document.querySelectorAll(".print-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => printBarcode(e.target.dataset.menu));
  });

  document.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => toggleTanggal(e.target.dataset.menu));
  });
}

// =====================================================
// 🗓️ TAMPILKAN TANGGAL PER MENU
// =====================================================
function toggleTanggal(menu) {
  const info = document.getElementById(`info-${menu}`);
  if (!info) return;
  const data = productions.filter((p) => p.menu === menu);

  if (info.classList.contains("hidden")) {
    info.innerHTML = data
      .map(
        (p) => `
      <div class="date-row">
        <div>
          <div><strong>📅 ${p.date}</strong></div>
          <div style="color:#666">Stok: ${p.qty}</div>
        </div>
        <div class="date-btns">
          <button class="small" onclick="updateBarcode('${menu}','${p.date}')">Gunakan Barcode</button>
          <button class="delete-btn small" onclick="deleteProduct('${menu}','${p.date}')">🗑️ Hapus</button>
          <button class="small" onclick="printBarcode('${menu}','${p.date}')">🖨️ Print</button>
        </div>
      </div>
    `
      )
      .join("");
    info.classList.remove("hidden");
    info.style.maxHeight = info.scrollHeight + "px";
  } else {
    info.style.maxHeight = "0";
    setTimeout(() => info.classList.add("hidden"), 300);
  }
}

// =====================================================
// 🧾 UPDATE BARCODE
// =====================================================
function updateBarcode(menu, date) {
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
// 🗑️ HAPUS PRODUK
// =====================================================
function deleteProduct(menu, date) {
  if (!confirm(`Hapus stok ${menu} (${date}) ?`)) return;
  productions = productions.filter(
    (p) => !(p.menu === menu && p.date === date)
  );
  localStorage.setItem("productions", JSON.stringify(productions));
  renderProducts();
}

// =====================================================
// 🖨️ PRINT BARCODE
// =====================================================
function printBarcode(menu, date = "") {
  const code = date ? `${menu}-${date}` : menu;
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Print ${menu}</title>
    <style>
      body{font-family:sans-serif;text-align:center;padding:20px}
      .label{display:inline-block;border:1px solid #ddd;padding:10px;border-radius:8px}
      .logo{font-weight:800;color:#d12a08;font-size:18px}
      .menu{font-size:16px;margin-top:8px}
      .date{font-size:12px;color:#666;margin-bottom:8px}
    </style>
    </head><body>
      <div class="label">
        <div class="logo">DISELL COFFEE</div>
        <div class="menu">${menu}</div>
        ${date ? `<div class="date">${date}</div>` : ""}
        <div id="qrcode"></div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
      <script>
        new QRCode(document.getElementById('qrcode'), {
          text: "${code}",
          width: 200, height: 200,
          colorDark:'#000', colorLight:'#fff',
          correctLevel: QRCode.CorrectLevel.H
        });
        window.onload = ()=>{window.print();window.onafterprint=()=>window.close();}
      </script>
    </body></html>
  `);
  w.document.close();
}

// =====================================================
// 📸 SCAN QR
// =====================================================
let html5QrCode;

startScanBtn.addEventListener("click", async () => {
  scanPopup.classList.remove("hidden");
  scanResult.textContent = "";
  readerDiv.innerHTML = "";

  await new Promise((res) => requestAnimationFrame(() => setTimeout(res, 300)));
  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => handleScan(decodedText)
    );
  } catch (err) {
    alert("⚠️ Kamera gagal dinyalakan: " + err.message);
    scanPopup.classList.add("hidden");
  }
});

async function handleScan(decodedText) {
  const found = productions.find((p) => `${p.menu}-${p.date}` === decodedText);
  await html5QrCode.stop();
  readerDiv.innerHTML = "";
  scanPopup.classList.add("hidden");

  if (!found) return alert("❌ Barcode tidak ditemukan di data produksi!");

  // Popup interaktif stok
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
    <div class="popup-content" style="color:#000;background:#fff;border:none;">
      <h3>📦 ${found.menu}</h3>
      <p><b>Tanggal:</b> ${found.date}</p>
      <p><b>Stok Saat Ini:</b> <span id="stok-val">${found.qty}</span></p>

      <div style="margin-top:10px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
        <button id="masukBtn" style="background:#4CAF50;color:#fff;border:none;padding:8px 12px;border-radius:8px;">Barang Masuk</button>
        <button id="keluarBtn" style="background:#d12a08;color:#fff;border:none;padding:8px 12px;border-radius:8px;">Barang Keluar</button>
        <button id="tutupBtn" style="background:#999;color:#fff;border:none;padding:8px 12px;border-radius:8px;">Tutup</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Barang Masuk
  popup.querySelector("#masukBtn").addEventListener("click", () => {
    const masuk = prompt("Masukkan jumlah barang masuk:", "1");
    const jumlah = parseInt(masuk);
    if (!jumlah || jumlah <= 0) return alert("Jumlah tidak valid.");

    found.qty += jumlah;
    updateStock(found, "Masuk", jumlah);
    popup.querySelector("#stok-val").textContent = found.qty;
    alert(`✅ ${jumlah} ${found.menu} masuk. Total: ${found.qty}`);
  });

  // Barang Keluar
  popup.querySelector("#keluarBtn").addEventListener("click", () => {
    const keluar = prompt("Masukkan jumlah barang keluar:", "1");
    const jumlah = parseInt(keluar);
    if (!jumlah || jumlah <= 0) return alert("Jumlah tidak valid.");
    if (jumlah > found.qty) return alert("Stok tidak cukup!");

    found.qty -= jumlah;
    updateStock(found, "Keluar", jumlah);
    popup.querySelector("#stok-val").textContent = found.qty;
    alert(`✅ ${jumlah} ${found.menu} keluar. Sisa: ${found.qty}`);
  });

  // Tutup popup
  popup.querySelector("#tutupBtn").addEventListener("click", () => {
    popup.remove();
  });
}

// =====================================================
// 🔁 UPDATE STOK + HISTORY
// =====================================================
function updateStock(item, type, jumlah) {
  const idx = productions.findIndex(
    (p) => p.menu === item.menu && p.date === item.date
  );
  if (idx >= 0) productions[idx] = item;

  localStorage.setItem("productions", JSON.stringify(productions));

  const now = new Date();
  histories.push({
    date: item.date,
    menu: item.menu,
    qty: jumlah,
    type,
    total: item.qty,
    time: now.toLocaleString("id-ID"),
  });

  localStorage.setItem("histories", JSON.stringify(histories));
  renderProducts();
  renderHistory();
}

// =====================================================
// 📋 RENDER HISTORI
// =====================================================
function renderHistory() {
  const tableBody = document.querySelector("#historyTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = histories
    .map(
      (h) => `
      <tr>
        <td>${h.date}</td>
        <td>${h.menu}</td>
        <td>${h.qty}</td>
        <td>${h.type}</td>
        <td>${h.total}</td>
        <td>${h.time}</td>
      </tr>`
    )
    .join("");
}

// =====================================================
// 🧹 STOP & CLOSE SCAN
// =====================================================
stopScanBtn.addEventListener("click", async () => {
  if (html5QrCode) await html5QrCode.stop().catch(() => {});
  readerDiv.innerHTML = "";
  scanPopup.classList.add("hidden");
});

closeScanBtn?.addEventListener("click", async () => {
  if (html5QrCode) await html5QrCode.stop().catch(() => {});
  readerDiv.innerHTML = "";
  scanPopup.classList.add("hidden");
});

// =====================================================
// 🚀 INIT
// =====================================================
renderProducts();
renderHistory();
// =====================================================
// 📜 POPUP RIWAYAT BARANG KELUAR
// =====================================================
const showHistoryBtn = document.getElementById("showHistoryBtn");
const historyPopup = document.getElementById("historyPopup");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const closePopupHistory = document.getElementById("closePopupHistory");

// Tampilkan popup
showHistoryBtn.addEventListener("click", () => {
  historyPopup.classList.remove("hidden");
  renderHistory();
});

// Tutup popup
[closeHistoryBtn, closePopupHistory].forEach((btn) =>
  btn.addEventListener("click", () => {
    historyPopup.classList.add("hidden");
  })
);

// =====================================================
// 📄 EXPORT PDF
// =====================================================
document.getElementById("exportPdfBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("l", "pt", "a4");

  pdf.text("Riwayat Barang Keluar - DISELL Coffee", 40, 40);
  html2canvas(document.querySelector("#historyTable")).then((canvas) => {
    const img = canvas.toDataURL("image/png");
    const width = 800;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 40, 60, width, height);
    pdf.save("riwayat-barang-keluar.pdf");
  });
});

// =====================================================
// =====================================================
// 📊 EXPORT EXCEL
// =====================================================
document.getElementById("exportExcelBtn").addEventListener("click", () => {
  if (histories.length === 0) return alert("Belum ada data riwayat!");

  const worksheet = XLSX.utils.json_to_sheet(histories);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat");

  const filename = `Riwayat_Barang_Keluar_DISELL_Coffee_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
});
