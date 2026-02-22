import { escapeHtml } from './dashboard.js';

function buildCustomerOptions(customers = [], selectedId = '') {
  const rows = ['<option value="">Sin cliente</option>'];
  customers.forEach((customer) => {
    const selected = customer.id === selectedId ? 'selected' : '';
    rows.push(`<option value="${customer.id}" ${selected}>${escapeHtml(customer.name)}</option>`);
  });
  return rows.join('');
}

function buildCategoryOptions(categories = [], selectedId = '', txType = '') {
  const rows = ['<option value="">Sin categoría</option>'];
  categories
    .filter((category) => category.type === 'both' || category.type === txType)
    .forEach((category) => {
      const selected = category.id === selectedId ? 'selected' : '';
      rows.push(`<option value="${category.id}" ${selected}>${escapeHtml(category.name)}</option>`);
    });

  return rows.join('');
}

export function renderTransactionsTable({ tableBody, transactions = [], customers = [], categories = [] }) {
  if (!tableBody) return;

  if (!transactions.length) {
    tableBody.innerHTML = '<tr><td colspan="8">No hay movimientos para este filtro.</td></tr>';
    return;
  }

  tableBody.innerHTML = transactions
    .map((tx) => {
      const txId = escapeHtml(tx.id);
      const detail = escapeHtml(tx.detail || '');
      const method = escapeHtml(tx.method || '');
      const date = escapeHtml(tx.date || '');
      const amount = Number(tx.amount_cents || 0) / 100;

      return `
      <tr data-tx-id="${txId}">
        <td>
          <select data-field="type" class="js-tx-field">
            <option value="income" ${tx.type === 'income' ? 'selected' : ''}>Ingreso</option>
            <option value="expense" ${tx.type === 'expense' ? 'selected' : ''}>Egreso</option>
          </select>
        </td>
        <td>
          <select data-field="customer_id" class="js-tx-field">
            ${buildCustomerOptions(customers, tx.customer_id || '')}
          </select>
        </td>
        <td>
          <select data-field="category_id" class="js-tx-field js-tx-category-select">
            ${buildCategoryOptions(categories, tx.category_id || '', tx.type)}
          </select>
        </td>
        <td><input data-field="amount_ars" class="js-tx-field" type="number" min="0" step="0.01" value="${amount}"></td>
        <td><input data-field="date" class="js-tx-field" type="date" value="${date}"></td>
        <td><input data-field="detail" class="js-tx-field" type="text" maxlength="5000" value="${detail}"></td>
        <td><input data-field="method" class="js-tx-field" type="text" maxlength="120" value="${method}"></td>
        <td>
          <div class="af-row-actions-inline">
            <button type="button" data-action="save">Guardar</button>
            <button type="button" data-action="duplicate" class="af-ghost-btn">Duplicar</button>
            <button type="button" data-action="delete" class="af-ghost-btn">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

export function renderTransactionsPagination(container, pagination = null) {
  if (!container) return;

  if (!pagination || !pagination.total) {
    container.innerHTML = '';
    return;
  }

  const page = Number(pagination.page || 1);
  const pages = Number(pagination.pages || 1);

  container.innerHTML = `
    <span>Página ${page} de ${pages} · ${pagination.total} movimientos</span>
    <button type="button" class="af-ghost-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
    <button type="button" class="af-ghost-btn" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>Siguiente</button>
  `;
}

export function readTransactionRow(row) {
  const readField = (field) => row.querySelector(`[data-field="${field}"]`)?.value ?? '';

  const amountArs = Number(readField('amount_ars'));
  const amount_cents = Number.isFinite(amountArs) && amountArs > 0 ? Math.round(amountArs * 100) : 0;

  return {
    id: row.dataset.txId,
    type: readField('type'),
    customer_id: readField('customer_id') || null,
    category_id: readField('category_id') || null,
    amount_cents,
    currency: 'ARS',
    date: readField('date'),
    detail: readField('detail').trim(),
    method: readField('method').trim()
  };
}

export function fillSelectOptions(selectElement, items = [], options = {}) {
  if (!selectElement) return;

  const {
    includeEmpty = true,
    emptyLabel = 'Todos',
    selected = '',
    typeFilter = null
  } = options;

  const rows = [];
  if (includeEmpty) {
    rows.push(`<option value="">${escapeHtml(emptyLabel)}</option>`);
  }

  items
    .filter((item) => {
      if (!typeFilter) return true;
      return item.type === 'both' || item.type === typeFilter;
    })
    .forEach((item) => {
      const isSelected = item.id === selected ? 'selected' : '';
      rows.push(`<option value="${item.id}" ${isSelected}>${escapeHtml(item.name)}</option>`);
    });

  selectElement.innerHTML = rows.join('');
}

export function syncCategorySelectForType(selectElement, categories = [], txType = 'income', selected = '') {
  fillSelectOptions(selectElement, categories, {
    includeEmpty: true,
    emptyLabel: 'Sin categoría',
    selected,
    typeFilter: txType
  });
}
