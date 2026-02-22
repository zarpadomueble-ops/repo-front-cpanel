const instances = new Map();

function getChartApi() {
  if (typeof window === 'undefined' || typeof window.Chart === 'undefined') {
    throw new Error('Chart.js no está disponible.');
  }

  return window.Chart;
}

function renderChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  if (instances.has(canvasId)) {
    instances.get(canvasId).destroy();
  }

  const Chart = getChartApi();
  const instance = new Chart(canvas, config);
  instances.set(canvasId, instance);
  return instance;
}

export function renderExpensesByCategory(canvasId, rows = []) {
  const labels = rows.map((row) => row.label || 'Sin categoría');
  const values = rows.map((row) => Number(row.total_cents || 0) / 100);

  return renderChart(canvasId, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#e76f51', '#f4a261', '#2a9d8f', '#264653', '#7d8597', '#8f2d56', '#fcbf49', '#457b9d']
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

export function renderIncomeExpenseByMonth(canvasId, rows = []) {
  const labels = rows.map((row) => row.month || '');
  const incomes = rows.map((row) => Number(row.income_cents || 0) / 100);
  const expenses = rows.map((row) => Number(row.expense_cents || 0) / 100);

  return renderChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomes,
          backgroundColor: '#2a9d8f'
        },
        {
          label: 'Egresos',
          data: expenses,
          backgroundColor: '#e76f51'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

export function renderCustomerBalance(canvasId, rows = []) {
  const labels = rows.map((row) => row.month || '');
  const balances = rows.map((row) => {
    const income = Number(row.income_cents || 0);
    const expense = Number(row.expense_cents || 0);
    return (income - expense) / 100;
  });

  return renderChart(canvasId, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Balance',
          data: balances,
          borderColor: '#0c6a8b',
          backgroundColor: 'rgba(12, 106, 139, 0.16)',
          tension: 0.25,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

export function destroyCharts() {
  instances.forEach((chart) => chart.destroy());
  instances.clear();
}
