import {
  API_BASE,
  ApiError,
  AuthError,
  authMe,
  clearCsrfCache,
  createCategory,
  createCustomer,
  createTransaction,
  deleteCategory,
  deleteCustomer,
  deleteTransaction,
  exportJson,
  getCsrfToken,
  getCustomerSummary,
  getSummary,
  importJson,
  listCategories,
  listCustomers,
  listTransactions,
  logout,
  moneyToCents,
  updateCategory,
  updateCustomer,
  updateTransaction
} from './api.js';
import {
  destroyCharts,
  renderCustomerBalance,
  renderExpensesByCategory,
  renderIncomeExpenseByMonth
} from './charts.js';
import { appendImportExportLog } from './ui/import-export.js';
import { renderKpis, renderTopCustomers } from './ui/dashboard.js';
import {
  fillSelectOptions,
  readTransactionRow,
  renderTransactionsPagination,
  renderTransactionsTable,
  syncCategorySelectForType
} from './ui/transactions.js';
import {
  readCustomerRow,
  renderCustomerDetailKpis,
  renderCustomerDetailTransactions,
  renderCustomersTable
} from './ui/customers.js';
import { readCategoryRow, renderCategoriesTable } from './ui/categories.js';

const state = {
  user: null,
  filters: {
    q: '',
    from: '',
    to: '',
    customerId: '',
    type: '',
    categoryId: ''
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  },
  summary: {
    totals: {
      income_cents: 0,
      expense_cents: 0,
      balance_cents: 0
    },
    charts: {
      expensesByCategory: [],
      monthlyIncomeExpense: [],
      topCustomers: []
    }
  },
  customers: [],
  categories: [],
  transactions: [],
  selectedCustomer: null,
  currentView: 'dashboard'
};

const elements = {
  feedback: document.getElementById('app-feedback'),
  navButtons: Array.from(document.querySelectorAll('.af-nav-btn')),
  views: Array.from(document.querySelectorAll('.af-view')),
  logoutBtn: document.getElementById('logout-btn'),
  searchInput: document.getElementById('global-search'),
  filterFrom: document.getElementById('filter-from'),
  filterTo: document.getElementById('filter-to'),
  filterCustomer: document.getElementById('filter-customer'),
  filterType: document.getElementById('filter-type'),
  filterCategory: document.getElementById('filter-category'),
  applyFiltersBtn: document.getElementById('apply-filters-btn'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),
  dashboardKpis: document.getElementById('dashboard-kpis'),
  topCustomersTable: document.getElementById('top-customers-table'),
  movimientosTotals: document.getElementById('movimientos-totals'),
  transactionsTableBody: document.querySelector('#transactions-table tbody'),
  transactionsPagination: document.getElementById('transactions-pagination'),
  openAddTransactionModalBtn: document.getElementById('open-add-transaction-modal'),
  transactionModal: document.getElementById('transaction-modal'),
  closeTransactionModalBtn: document.getElementById('close-transaction-modal'),
  transactionForm: document.getElementById('transaction-form'),
  txType: document.getElementById('tx-type'),
  txCustomer: document.getElementById('tx-customer'),
  txCategory: document.getElementById('tx-category'),
  txAmount: document.getElementById('tx-amount'),
  txDate: document.getElementById('tx-date'),
  txDetail: document.getElementById('tx-detail'),
  txMethod: document.getElementById('tx-method'),
  customersTableBody: document.querySelector('#customers-table tbody'),
  customerForm: document.getElementById('customer-form'),
  customerName: document.getElementById('customer-name'),
  customerNotes: document.getElementById('customer-notes'),
  customerDetailEmpty: document.getElementById('customer-detail-empty'),
  customerDetailContent: document.getElementById('customer-detail-content'),
  customerDetailKpis: document.getElementById('customer-detail-kpis'),
  customerDetailTransactions: document.getElementById('customer-detail-transactions'),
  categoriesTableBody: document.querySelector('#categories-table tbody'),
  categoryForm: document.getElementById('category-form'),
  categoryName: document.getElementById('category-name'),
  categoryType: document.getElementById('category-type'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  importFileInput: document.getElementById('import-file-input'),
  importJsonBtn: document.getElementById('import-json-btn'),
  importExportLog: document.getElementById('import-export-log'),
  apiBaseLabel: document.getElementById('api-base-label'),
  currentUserLabel: document.getElementById('current-user-label'),
  currentTenantLabel: document.getElementById('current-tenant-label')
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function setFeedback(message, type = '') {
  if (!elements.feedback) return;
  elements.feedback.textContent = message || '';
  elements.feedback.classList.remove('is-error', 'is-success');
  if (type === 'error') elements.feedback.classList.add('is-error');
  if (type === 'success') elements.feedback.classList.add('is-success');
}

function handleError(error) {
  if (error instanceof AuthError) {
    window.location.href = './login.html';
    return;
  }

  console.error(error);
  const message = error instanceof ApiError ? error.message : 'Ocurrió un error inesperado.';
  setFeedback(message, 'error');
}

function getFilterPayload() {
  return {
    q: state.filters.q,
    from: state.filters.from,
    to: state.filters.to,
    customerId: state.filters.customerId,
    type: state.filters.type,
    categoryId: state.filters.categoryId
  };
}

function readFiltersFromUi() {
  state.filters.q = String(elements.searchInput?.value || '').trim();
  state.filters.from = String(elements.filterFrom?.value || '').trim();
  state.filters.to = String(elements.filterTo?.value || '').trim();
  state.filters.customerId = String(elements.filterCustomer?.value || '').trim();
  state.filters.type = String(elements.filterType?.value || '').trim();
  state.filters.categoryId = String(elements.filterCategory?.value || '').trim();
}

function resetFiltersUi() {
  if (elements.searchInput) elements.searchInput.value = '';
  if (elements.filterFrom) elements.filterFrom.value = '';
  if (elements.filterTo) elements.filterTo.value = '';
  if (elements.filterCustomer) elements.filterCustomer.value = '';
  if (elements.filterType) elements.filterType.value = '';
  if (elements.filterCategory) elements.filterCategory.value = '';
  readFiltersFromUi();
}

function populateFilterSelects() {
  fillSelectOptions(elements.filterCustomer, state.customers, {
    includeEmpty: true,
    emptyLabel: 'Todos',
    selected: state.filters.customerId
  });

  fillSelectOptions(elements.filterCategory, state.categories, {
    includeEmpty: true,
    emptyLabel: 'Todas',
    selected: state.filters.categoryId
  });
}

function populateTransactionModalSelects() {
  fillSelectOptions(elements.txCustomer, state.customers, {
    includeEmpty: true,
    emptyLabel: 'Sin cliente',
    selected: ''
  });

  syncCategorySelectForType(elements.txCategory, state.categories, elements.txType?.value || 'income', '');
}

function renderDashboard() {
  renderKpis(elements.dashboardKpis, state.summary.totals);
  renderTopCustomers(elements.topCustomersTable, state.summary.charts.topCustomers || []);

  renderExpensesByCategory('chart-expenses-category', state.summary.charts.expensesByCategory || []);
  renderIncomeExpenseByMonth('chart-income-expense', state.summary.charts.monthlyIncomeExpense || []);
}

function renderMovimientos() {
  renderKpis(elements.movimientosTotals, state.summary.totals);

  renderTransactionsTable({
    tableBody: elements.transactionsTableBody,
    transactions: state.transactions,
    customers: state.customers,
    categories: state.categories
  });

  renderTransactionsPagination(elements.transactionsPagination, state.pagination);
}

function renderCustomersSection() {
  renderCustomersTable(elements.customersTableBody, state.customers);
}

function renderCategoriesSection() {
  renderCategoriesTable(elements.categoriesTableBody, state.categories);
}

function renderAll() {
  populateFilterSelects();
  populateTransactionModalSelects();
  renderDashboard();
  renderMovimientos();
  renderCustomersSection();
  renderCategoriesSection();

  elements.apiBaseLabel.textContent = API_BASE;
  elements.currentUserLabel.textContent = state.user?.username || '-';
  elements.currentTenantLabel.textContent = state.user?.tenantId || '-';
}

async function loadCoreData() {
  const filterPayload = getFilterPayload();

  const [customersRes, categoriesRes, summaryRes, transactionsRes] = await Promise.all([
    listCustomers(),
    listCategories(),
    getSummary(filterPayload),
    listTransactions({
      ...filterPayload,
      page: state.pagination.page,
      limit: state.pagination.limit
    })
  ]);

  state.customers = customersRes.data || [];
  state.categories = categoriesRes.data || [];
  state.summary = summaryRes.data || state.summary;
  state.transactions = transactionsRes.data || [];
  state.pagination = transactionsRes.pagination || state.pagination;
}

async function refreshAllData(showMessage = false) {
  if (showMessage) setFeedback('Actualizando datos...');

  await loadCoreData();
  renderAll();

  if (showMessage) {
    setFeedback('Datos actualizados.', 'success');
    window.setTimeout(() => setFeedback(''), 1800);
  }
}

function validateTransactionPayload(payload) {
  if (!payload.type || !['income', 'expense'].includes(payload.type)) {
    return 'Tipo inválido.';
  }

  if (!payload.date) {
    return 'La fecha es obligatoria.';
  }

  if (!payload.amount_cents || payload.amount_cents <= 0) {
    return 'El monto debe ser mayor a cero.';
  }

  return '';
}

function setView(viewName) {
  state.currentView = viewName;

  elements.navButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === viewName);
  });

  elements.views.forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === viewName);
  });

  window.location.hash = viewName;
}

async function showCustomerDetail(customerId) {
  const filters = getFilterPayload();
  const payload = await getCustomerSummary(customerId, {
    from: filters.from,
    to: filters.to
  });

  const data = payload.data;
  state.selectedCustomer = data;

  elements.customerDetailEmpty.classList.add('af-hidden');
  elements.customerDetailContent.classList.remove('af-hidden');

  renderCustomerDetailKpis(elements.customerDetailKpis, data.summary?.totals || {});
  renderCustomerDetailTransactions(elements.customerDetailTransactions, data.transactions || []);
  renderCustomerBalance('chart-customer-balance', data.summary?.charts?.monthlyIncomeExpense || []);
}

function closeCustomerDetail() {
  state.selectedCustomer = null;
  elements.customerDetailEmpty.classList.remove('af-hidden');
  elements.customerDetailContent.classList.add('af-hidden');
}

function downloadJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function bindNavigation() {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view || 'dashboard');
    });
  });
}

function bindFilters() {
  elements.applyFiltersBtn?.addEventListener('click', async () => {
    try {
      state.pagination.page = 1;
      readFiltersFromUi();
      await refreshAllData(true);
      closeCustomerDetail();
    } catch (error) {
      handleError(error);
    }
  });

  elements.clearFiltersBtn?.addEventListener('click', async () => {
    try {
      state.pagination.page = 1;
      resetFiltersUi();
      await refreshAllData(true);
      closeCustomerDetail();
    } catch (error) {
      handleError(error);
    }
  });

  elements.searchInput?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    try {
      state.pagination.page = 1;
      readFiltersFromUi();
      await refreshAllData(true);
    } catch (error) {
      handleError(error);
    }
  });
}

function bindTransactions() {
  elements.transactionsTableBody?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('[data-field="type"]')) {
      const row = target.closest('tr');
      const type = target.value;
      const categorySelect = row?.querySelector('.js-tx-category-select');
      syncCategorySelectForType(categorySelect, state.categories, type, '');
    }
  });

  elements.transactionsTableBody?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const actionButton = target.closest('button[data-action]');
    if (!(actionButton instanceof HTMLButtonElement)) return;

    const action = actionButton.dataset.action;
    const row = actionButton.closest('tr');
    if (!(row instanceof HTMLTableRowElement)) return;

    const payload = readTransactionRow(row);

    try {
      if (action === 'save') {
        const validationMessage = validateTransactionPayload(payload);
        if (validationMessage) {
          setFeedback(validationMessage, 'error');
          return;
        }

        await updateTransaction(payload.id, payload);
        setFeedback('Movimiento actualizado.', 'success');
      }

      if (action === 'duplicate') {
        const validationMessage = validateTransactionPayload(payload);
        if (validationMessage) {
          setFeedback(validationMessage, 'error');
          return;
        }

        const clonePayload = {
          ...payload,
          date: todayIsoDate()
        };

        delete clonePayload.id;

        await createTransaction(clonePayload);
        setFeedback('Movimiento duplicado.', 'success');
      }

      if (action === 'delete') {
        const confirmed = window.confirm('¿Eliminar este movimiento?');
        if (!confirmed) return;

        await deleteTransaction(payload.id);
        setFeedback('Movimiento eliminado.', 'success');
      }

      await refreshAllData(false);
    } catch (error) {
      handleError(error);
    }
  });

  elements.transactionsPagination?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const nextPage = Number(target.dataset.page || 0);
    if (!nextPage || nextPage < 1 || nextPage > (state.pagination.pages || 1)) return;

    try {
      state.pagination.page = nextPage;
      const txRes = await listTransactions({
        ...getFilterPayload(),
        page: state.pagination.page,
        limit: state.pagination.limit
      });
      state.transactions = txRes.data || [];
      state.pagination = txRes.pagination || state.pagination;
      renderMovimientos();
    } catch (error) {
      handleError(error);
    }
  });

  elements.openAddTransactionModalBtn?.addEventListener('click', () => {
    elements.txDate.value = todayIsoDate();
    elements.transactionModal?.showModal();
  });

  elements.closeTransactionModalBtn?.addEventListener('click', () => {
    elements.transactionModal?.close();
  });

  elements.txType?.addEventListener('change', () => {
    syncCategorySelectForType(elements.txCategory, state.categories, elements.txType.value, '');
  });

  elements.transactionForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      type: String(elements.txType.value || '').trim(),
      customer_id: String(elements.txCustomer.value || '').trim() || null,
      category_id: String(elements.txCategory.value || '').trim() || null,
      amount_cents: moneyToCents(elements.txAmount.value),
      currency: 'ARS',
      date: String(elements.txDate.value || '').trim(),
      detail: String(elements.txDetail.value || '').trim(),
      method: String(elements.txMethod.value || '').trim()
    };

    const validationMessage = validateTransactionPayload(payload);
    if (validationMessage) {
      setFeedback(validationMessage, 'error');
      return;
    }

    try {
      await createTransaction(payload);
      setFeedback('Movimiento creado.', 'success');
      elements.transactionForm.reset();
      elements.transactionModal?.close();
      await refreshAllData(false);
    } catch (error) {
      handleError(error);
    }
  });
}

function bindCustomers() {
  elements.customerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: String(elements.customerName.value || '').trim(),
      notes: String(elements.customerNotes.value || '').trim()
    };

    if (!payload.name) {
      setFeedback('El nombre del cliente es obligatorio.', 'error');
      return;
    }

    try {
      await createCustomer(payload);
      elements.customerForm.reset();
      setFeedback('Cliente creado.', 'success');
      await refreshAllData(false);
    } catch (error) {
      handleError(error);
    }
  });

  elements.customersTableBody?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest('button[data-action]');
    if (!(button instanceof HTMLButtonElement)) return;

    const action = button.dataset.action;
    const row = button.closest('tr');
    if (!(row instanceof HTMLTableRowElement)) return;

    const payload = readCustomerRow(row);

    try {
      if (action === 'save') {
        if (!payload.name) {
          setFeedback('El nombre del cliente no puede estar vacío.', 'error');
          return;
        }

        await updateCustomer(payload.id, {
          name: payload.name,
          notes: payload.notes
        });

        setFeedback('Cliente actualizado.', 'success');
        await refreshAllData(false);
      }

      if (action === 'detail') {
        await showCustomerDetail(payload.id);
        setFeedback(`Detalle cargado para ${payload.name}.`, 'success');
      }

      if (action === 'delete') {
        const confirmed = window.confirm('¿Eliminar este cliente?');
        if (!confirmed) return;

        await deleteCustomer(payload.id);
        closeCustomerDetail();
        setFeedback('Cliente eliminado.', 'success');
        await refreshAllData(false);
      }
    } catch (error) {
      handleError(error);
    }
  });
}

function bindCategories() {
  elements.categoryForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: String(elements.categoryName.value || '').trim(),
      type: String(elements.categoryType.value || 'both').trim()
    };

    if (!payload.name) {
      setFeedback('El nombre de la categoría es obligatorio.', 'error');
      return;
    }

    try {
      await createCategory(payload);
      elements.categoryForm.reset();
      elements.categoryType.value = 'both';
      setFeedback('Categoría creada.', 'success');
      await refreshAllData(false);
    } catch (error) {
      handleError(error);
    }
  });

  elements.categoriesTableBody?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest('button[data-action]');
    if (!(button instanceof HTMLButtonElement)) return;

    const action = button.dataset.action;
    const row = button.closest('tr');
    if (!(row instanceof HTMLTableRowElement)) return;

    const payload = readCategoryRow(row);

    try {
      if (action === 'save') {
        if (!payload.name) {
          setFeedback('El nombre de la categoría no puede quedar vacío.', 'error');
          return;
        }

        await updateCategory(payload.id, {
          name: payload.name,
          type: payload.type
        });
        setFeedback('Categoría actualizada.', 'success');
      }

      if (action === 'delete') {
        const confirmed = window.confirm('¿Eliminar esta categoría?');
        if (!confirmed) return;

        await deleteCategory(payload.id);
        setFeedback('Categoría eliminada.', 'success');
      }

      await refreshAllData(false);
    } catch (error) {
      handleError(error);
    }
  });
}

function bindImportExport() {
  elements.exportJsonBtn?.addEventListener('click', async () => {
    try {
      const payload = await exportJson();
      const filename = `admin-finanzas-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadJsonFile(payload.data, filename);
      appendImportExportLog(elements.importExportLog, 'Export OK', {
        customers: payload.data.customers?.length || 0,
        categories: payload.data.categories?.length || 0,
        transactions: payload.data.transactions?.length || 0
      });
      setFeedback('Export completado.', 'success');
    } catch (error) {
      handleError(error);
      appendImportExportLog(elements.importExportLog, 'Export ERROR', {
        message: error.message
      });
    }
  });

  elements.importJsonBtn?.addEventListener('click', async () => {
    const file = elements.importFileInput?.files?.[0];
    if (!file) {
      setFeedback('Seleccioná un archivo JSON para importar.', 'error');
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await importJson(json);
      appendImportExportLog(elements.importExportLog, 'Import OK', response.data);
      setFeedback('Import completado.', 'success');

      await refreshAllData(false);
    } catch (error) {
      handleError(error);
      appendImportExportLog(elements.importExportLog, 'Import ERROR', {
        message: error.message
      });
    }
  });
}

function bindLogout() {
  elements.logoutBtn?.addEventListener('click', async () => {
    try {
      await logout();
    } catch (_error) {
      // Si falla logout remoto, igualmente limpiar cache local de CSRF y salir.
    }

    clearCsrfCache();
    window.location.href = './login.html';
  });
}

function resolveInitialView() {
  const hash = window.location.hash.replace('#', '').trim();
  const knownViews = new Set(['dashboard', 'movimientos', 'clientes', 'categorias', 'import-export', 'ajustes']);
  if (hash && knownViews.has(hash)) {
    return hash;
  }

  return 'dashboard';
}

async function bootstrap() {
  setFeedback('Verificando sesión...');

  const me = await authMe();
  state.user = me.user;

  await getCsrfToken(true);

  bindNavigation();
  bindFilters();
  bindTransactions();
  bindCustomers();
  bindCategories();
  bindImportExport();
  bindLogout();

  readFiltersFromUi();
  await refreshAllData(false);

  setView(resolveInitialView());
  closeCustomerDetail();
  setFeedback('Listo.');
}

bootstrap().catch((error) => {
  handleError(error);
  destroyCharts();
});
