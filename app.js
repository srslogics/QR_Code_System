const STORAGE_KEY = "qr-pos-demo-state";
const BILL_KEY = "qr-pos-next-bill";

const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

const state = {
  items: savedState.items || [],
  billNumber: Number(localStorage.getItem(BILL_KEY) || savedState.billNumber || "1001"),
};

const els = {
  businessName: document.querySelector("#businessName"),
  businessAddress: document.querySelector("#businessAddress"),
  businessPhone: document.querySelector("#businessPhone"),
  upiId: document.querySelector("#upiId"),
  payeeName: document.querySelector("#payeeName"),
  currency: document.querySelector("#currency"),
  invoicePrefix: document.querySelector("#invoicePrefix"),
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
  receiptPaymentStatus: document.querySelector("#receiptPaymentStatus"),
  receiptUpi: document.querySelector("#receiptUpi"),
  metricTotal: document.querySelector("#metricTotal"),
  metricItems: document.querySelector("#metricItems"),
  metricBill: document.querySelector("#metricBill"),
  metricPayment: document.querySelector("#metricPayment"),
  saveState: document.querySelector("#saveState"),
  useBillTotalBtn: document.querySelector("#useBillTotalBtn"),
  generateQrBtn: document.querySelector("#generateQrBtn"),
  shareQrBtn: document.querySelector("#shareQrBtn"),
  printBillBtn: document.querySelector("#printBillBtn"),
  newBillBtn: document.querySelector("#newBillBtn"),
  loadDemoBtn: document.querySelector("#loadDemoBtn"),
  copyBillBtn: document.querySelector("#copyBillBtn"),
  clearItemsBtn: document.querySelector("#clearItemsBtn"),
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

function hydrate() {
  persistedFields.forEach((key) => {
    if (savedState[key] !== undefined && els[key]) {
      els[key].value = savedState[key];
    }
  });
}

function invoiceNumber() {
  const prefix = (els.invoicePrefix.value.trim() || "INV").toUpperCase();
  return `${prefix}-${state.billNumber}`;
}

function money(value) {
  const symbol = currencySymbols[els.currency.value] || `${els.currency.value} `;
  return `${symbol}${Number(value || 0).toFixed(2)}`;
}

function todayText() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

function getTotals() {
  const subtotal = state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * (Number(els.taxRate.value || 0) / 100);
  const discount = Math.min(Number(els.discount.value || 0), subtotal + tax);
  const total = Math.max(subtotal + tax - discount, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.qty, 0);
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

function clearQr(node) {
  node.innerHTML = "";
}

function renderQr(node, payload, size) {
  clearQr(node);
  if (!window.QRCode) {
    node.textContent = "QR engine is loading. Try again in a moment.";
    return false;
  }

  new QRCode(node, {
    text: payload,
    width: size,
    height: size,
    colorDark: "#111827",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
  return true;
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
    els.qrStatus.textContent = "Please enter an amount greater than zero.";
    clearQr(els.qrcode);
    return;
  }

  els.qrAmount.value = amount.toFixed(2);
  const payload = createPaymentPayload(amount);
  const rendered = renderQr(els.qrcode, payload, 190);
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
    els.itemsBody.innerHTML = '<tr class="empty-row"><td colspan="5">No items added yet.</td></tr>';
    return;
  }

  els.itemsBody.innerHTML = state.items
    .map((item, index) => {
      const lineTotal = item.qty * item.price;
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.qty}</td>
          <td>${money(item.price)}</td>
          <td>${money(lineTotal)}</td>
          <td><button class="row-delete" type="button" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderReceipt() {
  const dateText = todayText();
  const totals = getTotals();
  const customerParts = [
    els.customerName.value.trim() && `Customer: ${els.customerName.value.trim()}`,
    els.customerPhone.value.trim() && `Phone: ${els.customerPhone.value.trim()}`,
    els.cashierName.value.trim() && `Cashier: ${els.cashierName.value.trim()}`,
  ].filter(Boolean);

  els.billNumber.textContent = invoiceNumber();
  els.billDate.textContent = dateText;
  els.receiptTitle.textContent = els.businessName.value.trim() || "Your Store";
  els.receiptAddress.textContent = els.businessAddress.value.trim();
  els.receiptPhone.textContent = els.businessPhone.value.trim();
  els.receiptBillNo.textContent = invoiceNumber();
  els.receiptDate.textContent = dateText;
  els.receiptCustomer.textContent = customerParts.join(" | ");

  if (!state.items.length) {
    els.receiptItems.innerHTML = '<p class="empty-receipt">Items will appear here.</p>';
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
  els.receiptPaymentStatus.textContent = els.paymentStatus.value;
  els.receiptPaymentStatus.classList.toggle("paid", els.paymentStatus.value === "Paid");
  els.receiptUpi.textContent = els.upiId.value.trim() || "Payment QR";
  renderReceiptQr(totals.total);
}

function renderMetrics() {
  const totals = getTotals();
  els.metricTotal.textContent = money(totals.total);
  els.metricItems.textContent = String(totals.itemCount);
  els.metricBill.textContent = invoiceNumber();
  els.metricPayment.textContent = els.currency.value === "INR" && els.upiId.value.trim() ? "UPI QR" : "QR Text";
}

function renderAll() {
  renderItemsTable();
  renderReceipt();
  renderMetrics();
  persist();
}

function persist() {
  const nextState = {
    items: state.items,
    billNumber: state.billNumber,
  };
  persistedFields.forEach((key) => {
    if (els[key]) {
      nextState[key] = els[key].value;
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  localStorage.setItem(BILL_KEY, String(state.billNumber));
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

function addItem(event) {
  event.preventDefault();
  const name = els.itemName.value.trim();
  const qty = Number(els.itemQty.value);
  const price = Number(els.itemPrice.value);

  if (!name || qty <= 0 || price < 0) {
    return;
  }

  state.items.push({ name, qty, price });
  els.itemForm.reset();
  els.itemQty.value = "1";
  els.itemName.focus();
  renderAll();
}

function quickAdd(event) {
  const button = event.target.closest("button[data-name]");
  if (!button) {
    return;
  }
  state.items.push({
    name: button.dataset.name,
    qty: 1,
    price: Number(button.dataset.price),
  });
  renderAll();
}

function removeItem(event) {
  const button = event.target.closest(".row-delete");
  if (!button) {
    return;
  }
  state.items.splice(Number(button.dataset.index), 1);
  renderAll();
}

async function shareQr() {
  const amount = Number(els.qrAmount.value || 0);
  if (amount <= 0) {
    generateQr();
    return;
  }

  const text = `${els.businessName.value || "Payment"}: pay ${money(amount)} for ${invoiceNumber()}.`;
  const payload = createPaymentPayload(amount);
  const shareText = `${text}\n${payload}`;
  if (navigator.share) {
    await navigator.share({
      title: "Payment QR",
      text: shareText,
    });
    return;
  }

  await copyToClipboard(shareText);
  els.qrStatus.textContent = "Payment details copied. You can paste and send them.";
}

async function copyBill() {
  const totals = getTotals();
  const lines = [
    els.businessName.value.trim(),
    els.businessAddress.value.trim(),
    els.businessPhone.value.trim(),
    "",
    `${invoiceNumber()} | ${todayText()}`,
    els.customerName.value.trim() ? `Customer: ${els.customerName.value.trim()}` : "",
    "",
    ...state.items.map((item) => `${item.name} - ${item.qty} x ${money(item.price)} = ${money(item.qty * item.price)}`),
    "",
    `Subtotal: ${money(totals.subtotal)}`,
    `Tax / GST: ${money(totals.tax)}`,
    `Discount: ${money(totals.discount)}`,
    `Total: ${money(totals.total)}`,
    `Payment: ${els.paymentStatus.value}`,
    els.upiId.value.trim() ? `UPI: ${els.upiId.value.trim()}` : "",
  ].filter((line) => line !== "");

  await copyToClipboard(lines.join("\n"));
  els.saveState.textContent = "Bill copied";
  setTimeout(() => {
    els.saveState.textContent = "Saved locally";
  }, 1400);
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

function newBill() {
  state.items = [];
  state.billNumber += 1;
  localStorage.setItem(BILL_KEY, String(state.billNumber));
  els.customerName.value = "";
  els.customerPhone.value = "";
  els.discount.value = "0";
  els.paymentStatus.value = "Pending";
  els.qrAmount.value = "0";
  clearQr(els.qrcode);
  clearQr(els.receiptQr);
  els.qrStatus.textContent = "Enter an amount and generate QR.";
  renderAll();
}

function clearItems() {
  state.items = [];
  renderAll();
}

function loadDemoData() {
  state.items = [
    { name: "USB Cable", qty: 2, price: 199 },
    { name: "Mobile Cover", qty: 1, price: 299 },
    { name: "Charger", qty: 1, price: 799 },
  ];
  els.customerName.value = "Rahul Sharma";
  els.customerPhone.value = "+91 90000 11111";
  els.taxRate.value = "18";
  els.discount.value = "50";
  els.paymentStatus.value = "Pending";
  renderAll();
  generateQr(getTotals().total);
}

document.querySelector(".quick-items").addEventListener("click", quickAdd);
els.itemForm.addEventListener("submit", addItem);
els.itemsBody.addEventListener("click", removeItem);
els.useBillTotalBtn.addEventListener("click", () => generateQr(getTotals().total));
els.generateQrBtn.addEventListener("click", () => generateQr());
els.shareQrBtn.addEventListener("click", () => {
  shareQr().catch(() => {
    els.qrStatus.textContent = "Sharing was cancelled or unavailable.";
  });
});
els.copyBillBtn.addEventListener("click", () => {
  copyBill().catch(() => {
    els.saveState.textContent = "Copy unavailable";
  });
});
els.printBillBtn.addEventListener("click", () => window.print());
els.newBillBtn.addEventListener("click", newBill);
els.loadDemoBtn.addEventListener("click", loadDemoData);
els.clearItemsBtn.addEventListener("click", clearItems);

persistedFields.forEach((key) => {
  if (els[key]) {
    els[key].addEventListener("input", renderAll);
    els[key].addEventListener("change", renderAll);
  }
});

hydrate();
renderAll();
