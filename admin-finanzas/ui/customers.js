import { formatMoneyFromCents } from '../api.js';
import { escapeHtml } from './dashboard.js';

export function renderCustomersTable(tableBody, customers = []) {
  if (!tableBody) return;

  if (!customers.length) {
    tableBody.innerHTML = '<tr><td colspan="7">Sin clientes cargados.</td></tr>';
    return;
  }

  tableBody.innerHTML = customers
    .map((customer) => `
      <tr data-customer-id="${escapeHtml(customer.id)}">
        <td><input data-field="name" type="text" maxlength="255" value="${escapeHtml(customer.name)}"></td>
        <td><textarea data-field="notes" maxlength="5000">${escapeHtml(customer.notes || '')}</textarea></td>
        <td>${formatMoneyFromCents(customer.income_cents)}</td>
        <td>${formatMoneyFromCents(customer.expense_cents)}</td>
        <td>${formatMoneyFromCents(customer.balance_cents)}</td>
        <td>${Number(customer.transactions_count || 0)}</td>
        <td>
          <div class="af-row-actions-inline">
            <button type="button" data-action="save">Guardar</button>
            <button type="button" data-action="detail" class="af-ghost-btn">Detalle</button>
            <button type="button" data-action="delete" class="af-ghost-btn">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

export function readCustomerRow(row) {
  return {
    id: row.dataset.customerId,
    name: String(row.querySelector('[data-field="name"]')?.value || '').trim(),
    notes: String(row.querySelector('[data-field="notes"]')?.value || '').trim()
  };
}

export function renderCustomerDetailKpis(container, totals = {}) {
  if (!container) return;

  container.innerHTML = `
    <article class="af-kpi">
      <p>Ingresos</p>
      <strong>${formatMoneyFromCents(totals.income_cents)}</strong>
    </article>
    <article class="af-kpi">
      <p>Egresos</p>
      <strong>${formatMoneyFromCents(totals.expense_cents)}</strong>
    </article>
    <article class="af-kpi">
      <p>Balance</p>
      <strong>${formatMoneyFromCents(totals.balance_cents)}</strong>
    </article>
  `;
}

export function renderCustomerDetailTransactions(container, transactions = []) {
  if (!container) return;

  if (!transactions.length) {
    container.innerHTML = '<p>Este cliente no tiene movimientos.</p>';
    return;
  }

  container.innerHTML = `
    <div class="af-customer-detail-table">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .slice(0, 50)
            .map(
              (tx) => `
              <tr>
                <td>${escapeHtml(tx.date)}</td>
                <td>${tx.type === 'income' ? 'Ingreso' : 'Egreso'}</td>
                <td>${escapeHtml(tx.category_name || 'Sin categoría')}</td>
                <td>${formatMoneyFromCents(tx.amount_cents)}</td>
                <td>${escapeHtml(tx.detail || '')}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}
