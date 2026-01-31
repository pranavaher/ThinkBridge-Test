document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('invoice-container');

  try {
    const resp = await fetch('/api/invoice');
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json();

    const items = Array.isArray(data.items) ? data.items : [];
    const total = items.reduce((sum, item) => sum + toMoneyNumber(item.price), 0);

    let html = `
      <div class="invoice-header">
        <div>
          <h1 class="invoice-title">Invoice</h1>
          <div class="invoice-meta">
            <span class="pill">Invoice #${escapeHtml(data.invoiceId)}</span>
            <span class="pill">Customer: ${escapeHtml(data.customerName)}</span>
          </div>
        </div>
        <div class="invoice-total">
          <div class="invoice-total-label">Total</div>
          <div class="invoice-total-value">$${formatMoney(total)}</div>
        </div>
      </div>
    `;

    html += `<div class="cards-title">Line items</div>`;
    html += `<div class="cards">`;

    if (items.length === 0) {
      html += `
        <div class="empty">
          <div class="empty-title">No items</div>
          <div class="empty-subtitle">This invoice has no line items.</div>
        </div>
      `;
    } else {
      items.forEach((item, idx) => {
        const name = escapeHtml(item.name ?? `Item ${idx + 1}`);
        const price = toMoneyNumber(item.price);
        html += `
          <article class="card">
            <div class="card-top">
              <div class="card-name">${name}</div>
              <div class="card-badge">Item ${idx + 1}</div>
            </div>
            <div class="card-price">$${formatMoney(price)}</div>
          </article>
        `;
      });
    }

    html += `</div>`;

    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load invoice:', err);
    container.innerHTML = `
      <div class="error-card">
        <div class="error-title">Failed to load invoice</div>
        <div class="error-subtitle">Make sure the backend is running and Postgres is reachable.</div>
      </div>
    `;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[c]));
}

function toMoneyNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  return Number(n).toFixed(2);
}

