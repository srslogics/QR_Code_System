const STORAGE_KEY = "paybill-pro-state";
const BILL_KEY = "paybill-pro-next-bill";

const catalog = [
  { name: "USB Cable", category: "Accessories", price: 199, stock: 42 },
  { name: "Mobile Cover", category: "Accessories", price: 299, stock: 27 },
  { name: "Fast Charger", category: "Electronics", price: 799, stock: 18 },
  { name: "Screen Guard", category: "Accessories", price: 149, stock: 64 },
  { name: "Bluetooth Earbuds", category: "Electronics", price: 1499, stock: 11 },
  { name: "Power Bank", category: "Electronics", price: 2199, stock: 8 },
  { name: "Repair Service", category: "Service", price: 499, stock: 99 },
  { name: "Data Transfer", category: "Service", price: 249, stock: 99 },
];

const demoInvoices = [
  {
    invoiceNo: "INV-0998",
    customerName: "Ananya Gupta",
    customerPhone: "+91 91111 22222",
    date: "23 Apr 2026, 10:15 am",
    status: "Paid",
    total: 2347.82,
    items: [
      { name: "Bluetooth Earbuds", qty: 1, price: 1499 },
      { name: "Mobile Cover", qty: 1, price: 299 },
      { name: "Screen Guard", qty: 1, price: 149 },
    ],
  },
  {
    invoiceNo: "INV-0999",
    customerName: "Vikram Traders",
    customerPhone: "+91 92222 33333",
    date: "23 Apr 2026, 11:05 am",
    status: "Pending",
    total: 3066.82,
    items: [
      { name: "Power Bank", qty: 1, price: 2199 },
      { name: "USB Cable", qty: 2, price: 199 },
    ],
  },
  {
    invoiceNo: "INV-1000",
    customerName: "Walk-in",
    customerPhone: "",
    date: "23 Apr 2026, 12:20 pm",
    status: "Paid",
    total: 588.82,
    items: [
      { name: "Repair Service", qty: 1, price: 499 },
    ],
  },
];

const storage = createStorage();
const savedState = readStorage(STORAGE_KEY, {});

const state = {
  items: savedState.items || [],
  invoices: savedState.invoices || [],
  billNumber: Number(storage.getItem(BILL_KEY) || savedState.billNumber || "1001"),
  activeView: savedState.activeView || "dashboard",
};

const els = {
  navButtons: document.querySelectorAll(".nav-button"),
  views: document.querySelectorAll(".view"),
  jumpButtons: document.querySelectorAll("[data-jump]"),
  viewTitle: document.querySelector("#viewTitle"),
  saveState: document.querySelector("#saveState"),
  sidebarTotal: document.querySelector("#sidebarTotal"),
  catalogGrid: document.querySelector("#catalogGrid"),
  catalogSearch: document.querySelector("#catalogSearch"),
  billNumber: document.querySelector("#billNumber"),
  billDate: document.querySelector("#billDate"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQty: document.querySelector("#itemQty"),
  itemPrice: document.querySelector("#itemPrice"),
  itemsBody: document.querySelector("#itemsBody"),
  taxRate: document.querySelector("#taxRate"),
  discount: document.querySelector("#discount"),
  paymentStatus: document.querySelector("#paymentStatus"),
  customerName: document.querySelector("#customerName"),
  customerPhone: document.querySelector("#customerPhone"),
  cashierName: document.querySelector("#cashierName"),
  qrAmount: document.querySelector("#qrAmount"),
  qrNote: document.querySelector("#qrNote"),
  recipient: document.querySelector("#recipient"),
  qrcode: document.querySelector("#qrcode"),
  receiptQr: document.querySelector("#receiptQr"),
  qrStatus: document.querySelector("#qrStatus"),
  downloadQrLink: document.querySelector("#downloadQrLink"),
  businessName: document.querySelector("#businessName"),
  businessAddress: document.querySelector("#businessAddress"),
  businessPhone: document.querySelector("#businessPhone"),
  upiId: document.querySelector("#upiId"),
  payeeName: document.querySelector("#payeeName"),
  currency: document.querySelector("#currency"),
  invoicePrefix: document.querySelector("#invoicePrefix"),
  receiptTitle: document.querySelector("#receiptTitle"),
  receiptAddress: document.querySelector("#receiptAddress"),
  receiptPhone: document.querySelector("#receiptPhone"),
  receiptBillNo: document.querySelector("#receiptBillNo"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptCustomer: document.querySelector("#receiptCustomer"),
  receiptItems: document.querySelector("#receiptItems"),
  subtotalText: document.querySelector("#subtotalText"),
  taxText: document.querySelector("#taxText"),
  discountText: document.querySelector("#discountText"),
  totalText: document.querySelector("#totalText"),
  receiptPreviewTotal: document.querySelector("#receiptPreviewTotal"),
  receiptPaymentStatus: document.querySelector("#receiptPaymentStatus"),
  receiptUpi: document.querySelector("#receiptUpi"),
  metricCurrentTotal: document.querySelector("#metricCurrentTotal"),
  metricCurrentItems: document.querySelector("#metricCurrentItems"),
  metricRevenue: document.querySelector("#metricRevenue"),
  metricPaidCount: document.querySelector("#metricPaidCount"),
  metricPending: document.querySelector("#metricPending"),
  metricPendingCount: document.querySelector("#metricPendingCount"),
  metricInvoice: document.querySelector("#metricInvoice"),
  metricPaymentMode: document.querySelector("#metricPaymentMode"),
  summaryBillNo: document.querySelector("#summaryBillNo"),
  summaryCustomer: document.querySelector("#summaryCustomer"),
  summaryStatus: document.querySelector("#summaryStatus"),
  summaryTotal: document.querySelector("#summaryTotal"),
  activityList: document.querySelector("#activityList"),
  invoiceBody: document.querySelector("#invoiceBody"),
  useBillTotalBtn: document.querySelector("#useBillTotalBtn"),
  fillFromBillBtn: document.querySelector("#fillFromBillBtn"),
  generateQrBtn: document.querySelector("#generateQrBtn"),
  shareQrBtn: document.querySelector("#shareQrBtn"),
  copyBillBtn: document.querySelector("#copyBillBtn"),
  printBillBtn: document.querySelector("#printBillBtn"),
  saveInvoiceBtn: document.querySelector("#saveInvoiceBtn"),
  newBillBtn: document.querySelector("#newBillBtn"),
  loadDemoBtn: document.querySelector("#loadDemoBtn"),
};

const persistedFields = [
  "businessName",
  "businessAddress",
  "businessPhone",
  "upiId",
  "payeeName",
  "currency",
  "invoicePrefix",
  "taxRate",
  "discount",
  "paymentStatus",
  "customerName",
  "customerPhone",
  "cashierName",
  "qrAmount",
  "qrNote",
  "recipient",
];

const currencySymbols = {
  INR: "₹",
  USD: "$",
  AED: "د.إ ",
  EUR: "€",
};

function readStorage(key, fallback) {
  try {
    return JSON.parse(storage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function createStorage() {
  try {
    const testKey = "__paybill_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    const memory = {};
    return {
      getItem: (key) => memory[key] || null,
      setItem: (key, value) => {
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
      },
    };
  }
}

function hydrate() {
  persistedFields.forEach((key) => {
    if (savedState[key] !== undefined && els[key]) {
      els[key].value = savedState[key];
    }
  });
}

function invoiceNumber(number = state.billNumber) {
  const prefix = (els.invoicePrefix.value.trim() || "INV").toUpperCase();
  return `${prefix}-${number}`;
}

function money(value) {
  const symbol = currencySymbols[els.currency.value] || `${els.currency.value} `;
  return `${symbol}${Number(value || 0).toFixed(2)}`;
}

function nowText() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

function getTotals(items = state.items) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * (Number(els.taxRate.value || 0) / 100);
  const discount = Math.min(Number(els.discount.value || 0), subtotal + tax);
  const total = Math.max(subtotal + tax - discount, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  return { subtotal, tax, discount, total, itemCount };
}

function createPaymentPayload(amount) {
  const upiId = els.upiId.value.trim();
  const payeeName = els.payeeName.value.trim() || els.businessName.value.trim();
  const note = els.qrNote.value.trim() || `Bill ${invoiceNumber()}`;
  const currency = els.currency.value;

  if (currency === "INR" && upiId) {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: Number(amount).toFixed(2),
      cu: "INR",
      tn: note,
    });
    return `upi://pay?${params.toString()}`;
  }

  return `PAYMENT|PAYEE:${payeeName}|AMOUNT:${Number(amount).toFixed(2)}|CURRENCY:${currency}|NOTE:${note}|BILL:${invoiceNumber()}`;
}

function setView(viewName) {
  state.activeView = viewName;
  els.views.forEach((view) => {
    const isActive = view.id === `${viewName}View`;
    view.classList.toggle("active", isActive);
    if (isActive) {
      els.viewTitle.textContent = view.dataset.title;
    }
  });
  els.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  persist();
}

function renderCatalog() {
  const search = els.catalogSearch.value.trim().toLowerCase();
  const filtered = catalog.filter((item) => {
    return item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
  });

  els.catalogGrid.innerHTML = filtered
    .map(
      (item) => `
        <button class="catalog-item" type="button" data-name="${escapeHtml(item.name)}" data-price="${item.price}">
          <span>${escapeHtml(item.category)}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${money(item.price)} · ${item.stock} in stock</small>
        </button>
      `,
    )
    .join("");
}

function clearQr(node) {
  node.innerHTML = "";
}

function renderQr(node, payload, size) {
  clearQr(node);
  if (window.QRCode) {
    new window.QRCode(node, {
      text: payload,
      width: size,
      height: size,
      colorDark: "#111827",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel?.M ?? 0,
    });
    return true;
  }

  renderQrFallback(node, payload, size);
  return true;
}

function renderQrFallback(node, payload, size) {
  const encoded = encodeURIComponent(payload);
  node.innerHTML = `
    <img
      alt="Generated payment QR"
      width="${size}"
      height="${size}"
      src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}"
    >
  `;
}

function updateQrDownload() {
  const img = els.qrcode.querySelector("img");
  const canvas = els.qrcode.querySelector("canvas");
  if (img?.src) {
    els.downloadQrLink.href = img.src;
    return;
  }
  if (canvas) {
    els.downloadQrLink.href = canvas.toDataURL("image/png");
  }
}

function generateQr(amountSource = Number(els.qrAmount.value || 0)) {
  const amount = Number(amountSource || 0);
  if (!amount || amount <= 0) {
    els.qrStatus.textContent = "Enter an amount greater than zero.";
    clearQr(els.qrcode);
    return;
  }

  els.qrAmount.value = amount.toFixed(2);
  const rendered = renderQr(els.qrcode, createPaymentPayload(amount), 200);
  if (rendered) {
    const recipient = els.recipient.value.trim();
    els.qrStatus.textContent = `${money(amount)} QR ready${recipient ? ` for ${recipient}` : ""}.`;
    setTimeout(updateQrDownload, 50);
  }
  persist();
}

function renderReceiptQr(amount) {
  if (!amount || amount <= 0) {
    clearQr(els.receiptQr);
    return;
  }
  renderQr(els.receiptQr, createPaymentPayload(amount), 120);
}

function renderItemsTable() {
  if (!state.items.length) {
    els.itemsBody.innerHTML = '<tr class="empty-row"><td colspan="5">No items in the current bill.</td></tr>';
    return;
  }

  els.itemsBody.innerHTML = state.items
    .map((item, index) => {
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>
            <input class="qty-input" type="number" min="1" value="${item.qty}" data-index="${index}" aria-label="Quantity for ${escapeHtml(item.name)}">
          </td>
          <td>${money(item.price)}</td>
          <td>${money(item.qty * item.price)}</td>
          <td><button class="row-delete" type="button" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderReceipt() {
  const totals = getTotals();
  const customerParts = [
    els.customerName.value.trim() && `Customer: ${els.customerName.value.trim()}`,
    els.customerPhone.value.trim() && `Phone: ${els.customerPhone.value.trim()}`,
    els.cashierName.value.trim() && `Cashier: ${els.cashierName.value.trim()}`,
  ].filter(Boolean);

  els.billNumber.textContent = invoiceNumber();
  els.billDate.textContent = nowText();
  els.receiptTitle.textContent = els.businessName.value.trim() || "Your Store";
  els.receiptAddress.textContent = els.businessAddress.value.trim();
  els.receiptPhone.textContent = els.businessPhone.value.trim();
  els.receiptBillNo.textContent = invoiceNumber();
  els.receiptDate.textContent = nowText();
  els.receiptCustomer.textContent = customerParts.join(" | ");

  if (!state.items.length) {
    els.receiptItems.innerHTML = '<p class="empty-receipt">Add items to preview the customer receipt.</p>';
  } else {
    els.receiptItems.innerHTML = state.items
      .map(
        (item) => `
          <div class="receipt-line">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${item.qty} × ${money(item.price)}</small>
            </div>
            <strong>${money(item.qty * item.price)}</strong>
          </div>
        `,
      )
      .join("");
  }

  els.subtotalText.textContent = money(totals.subtotal);
  els.taxText.textContent = money(totals.tax);
  els.discountText.textContent = money(totals.discount);
  els.totalText.textContent = money(totals.total);
  els.receiptPreviewTotal.textContent = money(totals.total);
  els.receiptPaymentStatus.textContent = els.paymentStatus.value;
  els.receiptPaymentStatus.className = statusClass(els.paymentStatus.value);
  els.receiptUpi.textContent = els.upiId.value.trim() || "Payment QR";
  renderReceiptQr(totals.total);
}

function renderDashboard() {
  const totals = getTotals();
  const paidInvoices = state.invoices.filter((invoice) => invoice.status === "Paid");
  const pendingInvoices = state.invoices.filter((invoice) => invoice.status !== "Paid");
  const revenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const pending = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const customer = els.customerName.value.trim() || "Walk-in";
  const paymentMode = els.currency.value === "INR" && els.upiId.value.trim() ? "UPI QR enabled" : "QR text mode";

  els.metricCurrentTotal.textContent = money(totals.total);
  els.metricCurrentItems.textContent = `${totals.itemCount} items in cart`;
  els.metricRevenue.textContent = money(revenue);
  els.metricPaidCount.textContent = `${paidInvoices.length} paid invoices`;
  els.metricPending.textContent = money(pending);
  els.metricPendingCount.textContent = `${pendingInvoices.length} pending invoices`;
  els.metricInvoice.textContent = invoiceNumber();
  els.metricPaymentMode.textContent = paymentMode;
  els.sidebarTotal.textContent = money(revenue + pending);
  els.summaryBillNo.textContent = invoiceNumber();
  els.summaryCustomer.textContent = customer;
  els.summaryStatus.textContent = els.paymentStatus.value;
  els.summaryTotal.textContent = money(totals.total);

  const recent = state.invoices.slice(0, 5);
  els.activityList.innerHTML = recent.length
    ? recent
        .map(
          (invoice) => `
            <button class="activity-item" type="button" data-load-invoice="${escapeHtml(invoice.invoiceNo)}">
              <span>
                <strong>${escapeHtml(invoice.invoiceNo)}</strong>
                <small>${escapeHtml(invoice.customerName || "Walk-in")} · ${escapeHtml(invoice.date)}</small>
              </span>
              <em class="${statusClass(invoice.status)}">${escapeHtml(invoice.status)}</em>
              <b>${money(invoice.total)}</b>
            </button>
          `,
        )
        .join("")
    : '<p class="empty-state">Use Sample Sale or save your first bill.</p>';
}

function renderInvoices() {
  if (!state.invoices.length) {
    els.invoiceBody.innerHTML = '<tr class="empty-row"><td colspan="6">No saved invoices yet.</td></tr>';
    return;
  }

  els.invoiceBody.innerHTML = state.invoices
    .map(
      (invoice) => `
        <tr>
          <td>${escapeHtml(invoice.invoiceNo)}</td>
          <td>${escapeHtml(invoice.customerName || "Walk-in")}</td>
          <td>${escapeHtml(invoice.date)}</td>
          <td><span class="${statusClass(invoice.status)}">${escapeHtml(invoice.status)}</span></td>
          <td>${money(invoice.total)}</td>
          <td><button class="table-action" type="button" data-load-invoice="${escapeHtml(invoice.invoiceNo)}">Load</button></td>
        </tr>
      `,
    )
    .join("");
}

function renderAll() {
  renderCatalog();
  renderItemsTable();
  renderReceipt();
  renderDashboard();
  renderInvoices();
  persist();
}

function statusClass(status) {
  if (status === "Paid") {
    return "status-badge paid";
  }
  if (status === "Partially Paid") {
    return "status-badge partial";
  }
  return "status-badge pending";
}

function persist() {
  const nextState = {
    items: state.items,
    invoices: state.invoices,
    billNumber: state.billNumber,
    activeView: state.activeView,
  };
  persistedFields.forEach((key) => {
    if (els[key]) {
      nextState[key] = els[key].value;
    }
  });
  storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  storage.setItem(BILL_KEY, String(state.billNumber));
  els.saveState.textContent = "Saved locally";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addItemToBill(name, qty, price) {
  const existing = state.items.find((item) => item.name === name && item.price === price);
  if (existing) {
    existing.qty += qty;
  } else {
    state.items.push({ name, qty, price });
  }
  renderAll();
}

function addItem(event) {
  event.preventDefault();
  const name = els.itemName.value.trim();
  const qty = Number(els.itemQty.value);
  const price = Number(els.itemPrice.value);

  if (!name || qty <= 0 || price < 0) {
    return;
  }

  addItemToBill(name, qty, price);
  els.itemForm.reset();
  els.itemQty.value = "1";
  els.itemName.focus();
}

function handleCatalogClick(event) {
  const button = event.target.closest(".catalog-item");
  if (!button) {
    return;
  }
  addItemToBill(button.dataset.name, 1, Number(button.dataset.price));
}

function handleItemTableClick(event) {
  const button = event.target.closest(".row-delete");
  if (!button) {
    return;
  }
  state.items.splice(Number(button.dataset.index), 1);
  renderAll();
}

function handleQuantityChange(event) {
  if (!event.target.matches(".qty-input")) {
    return;
  }
  const index = Number(event.target.dataset.index);
  state.items[index].qty = Math.max(1, Number(event.target.value || 1));
  renderAll();
}

async function copyBill() {
  const totals = getTotals();
  const lines = [
    els.businessName.value.trim(),
    els.businessAddress.value.trim(),
    els.businessPhone.value.trim(),
    "",
    `${invoiceNumber()} | ${nowText()}`,
    els.customerName.value.trim() ? `Customer: ${els.customerName.value.trim()}` : "Customer: Walk-in",
    els.customerPhone.value.trim() ? `Phone: ${els.customerPhone.value.trim()}` : "",
    "",
    ...state.items.map((item) => `${item.name} - ${item.qty} x ${money(item.price)} = ${money(item.qty * item.price)}`),
    "",
    `Subtotal: ${money(totals.subtotal)}`,
    `GST / Tax: ${money(totals.tax)}`,
    `Discount: ${money(totals.discount)}`,
    `Total: ${money(totals.total)}`,
    `Payment: ${els.paymentStatus.value}`,
    els.upiId.value.trim() ? `UPI: ${els.upiId.value.trim()}` : "",
  ].filter((line) => line !== "");

  await copyToClipboard(lines.join("\n"));
  flashSaveState("Bill copied");
}

async function shareQr() {
  const amount = Number(els.qrAmount.value || 0);
  if (amount <= 0) {
    generateQr();
    return;
  }

  const payload = createPaymentPayload(amount);
  const recipient = els.recipient.value.trim();
  const shareText = [
    `${els.businessName.value || "Payment request"}${recipient ? ` for ${recipient}` : ""}`,
    `Amount: ${money(amount)}`,
    `Bill: ${invoiceNumber()}`,
    payload,
  ].join("\n");

  await copyToClipboard(shareText);
  els.qrStatus.textContent = "Share message copied. Paste it in WhatsApp, SMS, or email.";
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function saveInvoice() {
  if (!state.items.length) {
    flashSaveState("Add items first");
    return;
  }

  const totals = getTotals();
  const invoice = {
    invoiceNo: invoiceNumber(),
    billNumber: state.billNumber,
    date: nowText(),
    customerName: els.customerName.value.trim() || "Walk-in",
    customerPhone: els.customerPhone.value.trim(),
    cashierName: els.cashierName.value.trim(),
    status: els.paymentStatus.value,
    subtotal: totals.subtotal,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
    items: cloneData(state.items),
  };

  state.invoices = [invoice, ...state.invoices.filter((item) => item.invoiceNo !== invoice.invoiceNo)];
  flashSaveState("Invoice saved");
  renderAll();
}

function loadInvoice(invoiceNo) {
  const invoice = state.invoices.find((item) => item.invoiceNo === invoiceNo);
  if (!invoice) {
    return;
  }

  state.items = cloneData(invoice.items);
  state.billNumber = invoice.billNumber || state.billNumber;
  els.customerName.value = invoice.customerName === "Walk-in" ? "" : invoice.customerName;
  els.customerPhone.value = invoice.customerPhone || "";
  els.paymentStatus.value = invoice.status;
  els.discount.value = String(invoice.discount || 0);
  setView("pos");
  renderAll();
  flashSaveState(`${invoiceNo} loaded`);
}

function newBill() {
  state.items = [];
  state.billNumber += 1;
  storage.setItem(BILL_KEY, String(state.billNumber));
  els.customerName.value = "";
  els.customerPhone.value = "";
  els.discount.value = "0";
  els.paymentStatus.value = "Pending";
  els.qrAmount.value = "0";
  clearQr(els.qrcode);
  clearQr(els.receiptQr);
  els.qrStatus.textContent = "Enter an amount and generate QR.";
  setView("pos");
  renderAll();
}

function fillPaymentFromBill() {
  const total = getTotals().total;
  els.qrAmount.value = total.toFixed(2);
  els.qrNote.value = `${invoiceNumber()} payment`;
  els.recipient.value = els.customerPhone.value.trim() || els.customerName.value.trim();
  generateQr(total);
  setView("payments");
}

function loadDemoData() {
  state.items = [
    { name: "Fast Charger", qty: 1, price: 799 },
    { name: "USB Cable", qty: 2, price: 199 },
    { name: "Screen Guard", qty: 1, price: 149 },
  ];
  state.invoices = cloneData(demoInvoices);
  state.billNumber = 1001;
  els.businessName.value = "Shree Digital Store";
  els.businessAddress.value = "Main Market Road, New Delhi";
  els.businessPhone.value = "+91 98765 43210";
  els.upiId.value = "merchant@upi";
  els.payeeName.value = "Shree Digital Store";
  els.currency.value = "INR";
  els.invoicePrefix.value = "INV";
  els.customerName.value = "Rahul Sharma";
  els.customerPhone.value = "+91 90000 11111";
  els.cashierName.value = "Counter 1";
  els.taxRate.value = "18";
  els.discount.value = "50";
  els.paymentStatus.value = "Pending";
  els.qrNote.value = "Bill payment";
  fillPaymentFromBill();
  flashSaveState("Sample loaded");
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function flashSaveState(message) {
  els.saveState.textContent = message;
  setTimeout(() => {
    els.saveState.textContent = "Saved locally";
  }, 1600);
}

function attachEvents() {
  els.navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  els.jumpButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.jump));
  });
  els.catalogGrid.addEventListener("click", handleCatalogClick);
  els.catalogSearch.addEventListener("input", renderCatalog);
  els.itemForm.addEventListener("submit", addItem);
  els.itemsBody.addEventListener("click", handleItemTableClick);
  els.itemsBody.addEventListener("change", handleQuantityChange);
  els.useBillTotalBtn.addEventListener("click", fillPaymentFromBill);
  els.fillFromBillBtn.addEventListener("click", fillPaymentFromBill);
  els.generateQrBtn.addEventListener("click", () => generateQr());
  els.shareQrBtn.addEventListener("click", () => shareQr().catch(() => {
    els.qrStatus.textContent = "Copy unavailable in this browser.";
  }));
  els.copyBillBtn.addEventListener("click", () => copyBill().catch(() => flashSaveState("Copy unavailable")));
  els.printBillBtn.addEventListener("click", () => window.print());
  els.saveInvoiceBtn.addEventListener("click", saveInvoice);
  els.newBillBtn.addEventListener("click", newBill);
  els.loadDemoBtn.addEventListener("click", loadDemoData);

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-load-invoice]");
    if (button) {
      loadInvoice(button.dataset.loadInvoice);
    }
  });

  persistedFields.forEach((key) => {
    if (els[key]) {
      els[key].addEventListener("input", renderAll);
      els[key].addEventListener("change", renderAll);
    }
  });
}

hydrate();
attachEvents();
renderAll();
setView(state.activeView);
