document.addEventListener('DOMContentLoaded', async function () {
  const select = document.getElementById('customer-select');
  const container = document.getElementById('invoices-container');

  try {
    const customers = await fetchJson('/api/invoices/customers');
    customers.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  } catch (e) {
    // Non-fatal: still allow "all invoices"
    console.warn('Failed to load customers', e);
  }

  const params = new URLSearchParams(window.location.search);
  const initialCustomer = params.get('customerName') || '';
  if (initialCustomer) select.value = initialCustomer;

  select.addEventListener('change', () => {
    const next = new URL(window.location.href);
    if (select.value) next.searchParams.set('customerName', select.value);
    else next.searchParams.delete('customerName');
    window.history.replaceState({}, '', next);
    loadInvoices();
  });

  await loadInvoices();

  async function loadInvoices() {
    container.innerHTML = `
      <div class="skeleton">
        <div class="skeleton-line w-35"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      </div>
    `;

    try {
      const q = new URLSearchParams();
      if (select.value) q.set('customerName', select.value);

      const invoices = await fetchJson(`/api/invoices${q.toString() ? `?${q}` : ''}`);

      if (!Array.isArray(invoices) || invoices.length === 0) {
        container.innerHTML = `
          <div class="empty">
            <div class="empty-title">No invoices</div>
            <div class="empty-subtitle">Try another customer filter.</div>
          </div>
        `;
        return;
      }

      let html = `<div class="cards">`;
      invoices.forEach((inv) => {
        const id = inv.invoiceId;
        const customer = escapeHtml(inv.customerName);
        const total = formatMoney(toMoneyNumber(inv.total));
        const itemCount = Number(inv.itemCount || 0);
        const itemLabel = itemCount === 1 ? 'item' : 'items';

        html += `
          <article class="card card-link">
            <a class="card-a" href="/?invoiceId=${encodeURIComponent(id)}" aria-label="Open invoice ${id}">
              <div class="card-top">
                <div class="card-name">${customer}</div>
                <div class="card-badge">Invoice #${escapeHtml(id)}</div>
              </div>
              <div class="card-row">
                <div class="muted">${itemCount} ${itemLabel}</div>
                <div class="card-price">$${total}</div>
              </div>
            </a>
          </article>
        `;
      });
      html += `</div>`;

      container.innerHTML = html;
    } catch (err) {
      console.error('Failed to load invoices:', err);
      container.innerHTML = `
        <div class="error-card">
          <div class="error-title">Failed to load invoices</div>
          <div class="error-subtitle">Make sure the backend is running and Postgres is reachable.</div>
        </div>
      `;
    }
  }
});

async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return await resp.json();
}

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

