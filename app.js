const state = {
  items: [],
  billNumber: Number(localStorage.getItem("billNumber") || "1001"),
};

const els = {
  businessName: document.querySelector("#businessName"),
  upiId: document.querySelector("#upiId"),
  payeeName: document.querySelector("#payeeName"),
  currency: document.querySelector("#currency"),
  billNumber: document.querySelector("#billNumber"),
  billDate: document.querySelector("#billDate"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQty: document.querySelector("#itemQty"),
  itemPrice: document.querySelector("#itemPrice"),
  itemsBody: document.querySelector("#itemsBody"),
  taxRate: document.querySelector("#taxRate"),
  discount: document.querySelector("#discount"),
  customerName: document.querySelector("#customerName"),
  qrAmount: document.querySelector("#qrAmount"),
  qrNote: document.querySelector("#qrNote"),
  recipient: document.querySelector("#recipient"),
  qrcode: document.querySelector("#qrcode"),
  receiptQr: document.querySelector("#receiptQr"),
  qrStatus: document.querySelector("#qrStatus"),
  downloadQrLink: document.querySelector("#downloadQrLink"),
  receiptTitle: document.querySelector("#receiptTitle"),
  receiptBillNo: document.querySelector("#receiptBillNo"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptCustomer: document.querySelector("#receiptCustomer"),
  receiptItems: document.querySelector("#receiptItems"),
  subtotalText: document.querySelector("#subtotalText"),
  taxText: document.querySelector("#taxText"),
  discountText: document.querySelector("#discountText"),
  totalText: document.querySelector("#totalText"),
  useBillTotalBtn: document.querySelector("#useBillTotalBtn"),
  generateQrBtn: document.querySelector("#generateQrBtn"),
  shareQrBtn: document.querySelector("#shareQrBtn"),
  printBillBtn: document.querySelector("#printBillBtn"),
  newBillBtn: document.querySelector("#newBillBtn"),
};

const currencySymbols = {
  INR: "₹",
  USD: "$",
  AED: "د.إ ",
  EUR: "€",
};

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
  return { subtotal, tax, discount, total };
}

function createPaymentPayload(amount) {
  const upiId = els.upiId.value.trim();
  const payeeName = els.payeeName.value.trim() || els.businessName.value.trim();
  const note = els.qrNote.value.trim() || `Bill ${state.billNumber}`;
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

  return `PAYMENT|PAYEE:${payeeName}|AMOUNT:${Number(amount).toFixed(2)}|CURRENCY:${currency}|NOTE:${note}|BILL:${state.billNumber}`;
}

function clearQr(node) {
  node.innerHTML = "";
}

function renderQr(node, payload, size) {
  clearQr(node);
  if (!window.QRCode) {
    node.textContent = "QR library is loading. Try again in a moment.";
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
    els.qrStatus.textContent = `${money(amount)} QR ready${els.recipient.value ? ` for ${els.recipient.value}` : ""}.`;
    setTimeout(updateQrDownload, 50);
  }
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

  els.billNumber.textContent = `Bill #${state.billNumber}`;
  els.billDate.textContent = dateText;
  els.receiptTitle.textContent = els.businessName.value.trim() || "Your Store";
  els.receiptBillNo.textContent = `Bill #${state.billNumber}`;
  els.receiptDate.textContent = dateText;
  els.receiptCustomer.textContent = els.customerName.value.trim()
    ? `Customer: ${els.customerName.value.trim()}`
    : "";

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
  renderReceiptQr(totals.total);
}

function renderAll() {
  renderItemsTable();
  renderReceipt();
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

  const text = `${els.businessName.value || "Payment"}: pay ${money(amount)} for Bill #${state.billNumber}.`;
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
  localStorage.setItem("billNumber", String(state.billNumber));
  els.customerName.value = "";
  els.discount.value = "0";
  els.taxRate.value = "0";
  els.qrAmount.value = "0";
  clearQr(els.qrcode);
  clearQr(els.receiptQr);
  els.qrStatus.textContent = "Enter an amount and generate QR.";
  renderAll();
}

els.itemForm.addEventListener("submit", addItem);
els.itemsBody.addEventListener("click", removeItem);
els.useBillTotalBtn.addEventListener("click", () => generateQr(getTotals().total));
els.generateQrBtn.addEventListener("click", () => generateQr());
els.shareQrBtn.addEventListener("click", () => {
  shareQr().catch(() => {
    els.qrStatus.textContent = "Sharing was cancelled or unavailable.";
  });
});
els.printBillBtn.addEventListener("click", () => window.print());
els.newBillBtn.addEventListener("click", newBill);

[
  els.businessName,
  els.payeeName,
  els.upiId,
  els.currency,
  els.taxRate,
  els.discount,
  els.customerName,
  els.qrNote,
].forEach((input) => input.addEventListener("input", renderAll));

renderAll();
