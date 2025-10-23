// === Ambil elemen ===
const form = document.getElementById("addForm");
const menuSelect = document.getElementById("menu");
const qtyInput = document.getElementById("qty");
const productList = document.getElementById("productList");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const startScanBtn = document.getElementById("startScanBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const readerDiv = document.getElementById("reader");
const scanResult = document.getElementById("scanResult");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const uploadJsonInput = document.getElementById("uploadJsonInput");
const resetDataBtn = document.getElementById("resetDataBtn");
const printAllBtn = document.getElementById("printAllBtn");
const scanPopup = document.getElementById("scanPopup");
const closeScanBtn = document.getElementById("closeScanBtn");

// === Data -->
let productions = JSON.parse(localStorage.getItem("productions") || "[]");

// === UI events ===
toggleFormBtn.addEventListener("click", () => form.classList.toggle("hidden"));
document
  .getElementById("cancelAdd")
  ?.addEventListener("click", () => form.classList.add("hidden"));

// === Tambah Produk ===
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
  renderProducts();
  form.classList.add("hidden");
});

// === Render produk ===
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

  document.querySelectorAll(".barcode-container").forEach((bc) => {
    bc.addEventListener("click", () => {
      document
        .querySelectorAll(".barcode-container")
        .forEach((el) => el.classList.remove("active"));
      bc.classList.add("active");
    });
  });

  document.querySelectorAll(".print-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => printBarcode(e.target.dataset.menu));
  });

  document.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => toggleTanggal(e.target.dataset.menu));
  });
}

// === Toggle tanggal ===
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
      </div>`
      )
      .join("");
    info.classList.remove("hidden");
  } else {
    info.classList.add("hidden");
  }
}

// === Delete ===
function deleteProduct(menu, date) {
  if (!confirm(`Hapus stok ${menu} (${date}) ?`)) return;
  productions = productions.filter(
    (p) => !(p.menu === menu && p.date === date)
  );
  localStorage.setItem("productions", JSON.stringify(productions));
  renderProducts();
}

// === Scan Barcode ===
let html5QrCode;

startScanBtn.addEventListener("click", async () => {
  scanPopup.classList.remove("hidden");
  scanResult.textContent = "";
  const readerContainer = document.getElementById("reader");
  readerContainer.innerHTML = "";

  await new Promise((res) => requestAnimationFrame(() => setTimeout(res, 300)));
  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        const found = productions.find(
          (p) => `${p.menu}-${p.date}` === decodedText
        );

        if (found) {
          // tampilkan popup detail
          document.getElementById("detailMenu").textContent = found.menu;
          document.getElementById("detailDate").textContent = found.date;
          document.getElementById("detailStock").textContent = found.qty;
          document.getElementById("checkoutQty").value = "";
          document.getElementById("detailPopup").classList.remove("hidden");
          window.scannedProduct = found;
        } else {
          scanResult.textContent = "❌ Barcode tidak ditemukan!";
        }

        html5QrCode.stop().then(() => {
          readerContainer.innerHTML = "";
          scanPopup.classList.add("hidden");
        });
      }
    );
  } catch (err) {
    console.error("Gagal akses kamera:", err);
    alert("⚠️ Gagal menyalakan kamera. Pastikan izin sudah diberikan.");
    scanPopup.classList.add("hidden");
  }
});

// === Tutup Scan ===
closeScanBtn.addEventListener("click", async () => {
  if (html5QrCode) await html5QrCode.stop().catch(() => {});
  scanPopup.classList.add("hidden");
  document.getElementById("reader").innerHTML = "";
});

// === Checkout Produk ===
const detailPopup = document.getElementById("detailPopup");
const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");

cancelCheckoutBtn.addEventListener("click", () => {
  detailPopup.classList.add("hidden");
  window.scannedProduct = null;
});

confirmCheckoutBtn.addEventListener("click", () => {
  if (!window.scannedProduct) return alert("Produk tidak ditemukan.");
  const qtyOut = parseInt(document.getElementById("checkoutQty").value);
  if (!qtyOut || qtyOut <= 0)
    return alert("Masukkan jumlah keluar yang benar.");

  const product = productions.find(
    (p) =>
      p.menu === window.scannedProduct.menu &&
      p.date === window.scannedProduct.date
  );

  if (!product) return alert("Produk tidak ditemukan di data stok.");
  if (qtyOut > product.qty) return alert("Jumlah keluar melebihi stok!");

  product.qty -= qtyOut;
  localStorage.setItem("productions", JSON.stringify(productions));

  alert(
    `✅ ${qtyOut} ${product.menu} berhasil dikeluarkan.\nSisa stok: ${product.qty}`
  );
  renderProducts();
  detailPopup.classList.add("hidden");
  window.scannedProduct = null;
});

renderProducts();
