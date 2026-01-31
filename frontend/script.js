document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('invoice-container');

  try {
    const resp = await fetch('/api/invoice');
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json();

    let html = `<h2>${escapeHtml(data.customerName)} (Invoice #${data.invoiceId})</h2>`;
    html += '<ul>';
    (data.items || []).forEach((item) => {
      html += `<li>${escapeHtml(item.name)} - $${Number(item.price).toFixed(2)}</li>`;
    });
    html += '</ul>';

    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load invoice:', err);
    container.innerHTML = `<p class="error">Failed to load invoice.</p>`;
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

