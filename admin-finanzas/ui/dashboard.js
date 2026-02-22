import { formatMoneyFromCents } from '../api.js';

export function renderKpis(container, totals = {}) {
  if (!container) return;

  const income = Number(totals.income_cents || 0);
  const expense = Number(totals.expense_cents || 0);
  const balance = Number(totals.balance_cents || 0);

  container.innerHTML = `
    <article class="af-kpi">
      <p>Ingresos</p>
      <strong>${formatMoneyFromCents(income)}</strong>
    </article>
    <article class="af-kpi">
      <p>Egresos</p>
      <strong>${formatMoneyFromCents(expense)}</strong>
    </article>
    <article class="af-kpi">
      <p>Balance</p>
      <strong>${formatMoneyFromCents(balance)}</strong>
    </article>
  `;
}

export function renderTopCustomers(container, rows = []) {
  if (!container) return;

  if (!rows.length) {
    container.innerHTML = '<p>Sin datos para mostrar.</p>';
    return;
  }

  container.innerHTML = `
    <div class="af-top-customers">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Ingresos</th>
            <th>Egresos</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
              <tr>
                <td>${escapeHtml(row.customer_name || 'Sin cliente')}</td>
                <td>${formatMoneyFromCents(row.income_cents)}</td>
                <td>${formatMoneyFromCents(row.expense_cents)}</td>
                <td>${formatMoneyFromCents(row.balance_cents)}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
