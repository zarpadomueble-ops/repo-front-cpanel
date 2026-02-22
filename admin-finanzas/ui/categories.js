import { escapeHtml } from './dashboard.js';

function categoryTypeLabel(type) {
  if (type === 'income') return 'Ingreso';
  if (type === 'expense') return 'Egreso';
  return 'Ambos';
}

export function renderCategoriesTable(tableBody, categories = []) {
  if (!tableBody) return;

  if (!categories.length) {
    tableBody.innerHTML = '<tr><td colspan="4">Sin categorías cargadas.</td></tr>';
    return;
  }

  tableBody.innerHTML = categories
    .map((category) => `
      <tr data-category-id="${escapeHtml(category.id)}">
        <td><input data-field="name" type="text" maxlength="255" value="${escapeHtml(category.name)}"></td>
        <td>
          <select data-field="type">
            <option value="both" ${category.type === 'both' ? 'selected' : ''}>Ambos</option>
            <option value="income" ${category.type === 'income' ? 'selected' : ''}>Ingreso</option>
            <option value="expense" ${category.type === 'expense' ? 'selected' : ''}>Egreso</option>
          </select>
        </td>
        <td>${Number(category.transactions_count || 0)}</td>
        <td>
          <div class="af-row-actions-inline">
            <button type="button" data-action="save">Guardar</button>
            <button type="button" data-action="delete" class="af-ghost-btn">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

export function readCategoryRow(row) {
  return {
    id: row.dataset.categoryId,
    name: String(row.querySelector('[data-field="name"]')?.value || '').trim(),
    type: String(row.querySelector('[data-field="type"]')?.value || 'both').trim()
  };
}

export function mapCategoryTypes(categories = []) {
  return categories.reduce((acc, current) => {
    acc[current.id] = categoryTypeLabel(current.type);
    return acc;
  }, {});
}
