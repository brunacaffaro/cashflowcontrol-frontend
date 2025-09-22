
const API_BASE = 'http://192.168.1.6:5000';

///Insert Data + Form Functions
/** Function 1 - Collects input values, validates, and submits a new transaction.
 * On success, clears inputs, refreshes the table, and shows a confirmation. */
async function newItem() {
  const inputName = document.getElementById('newInput').value.trim();
  const inputDate = document.getElementById('newDate').value; // YYYY-MM-DD
  const inputAmount = document.getElementById('newAmount').value;
  const inputType = document.getElementById('newType').value;
  const inputCategory = document.getElementById('newCategory').value;
  const inputComment = document.getElementById('newComment').value;
  const inputStatus = document.getElementById('newStatus').checked;
  if (!inputName) {
    showError('Escreva o nome do lançamento!');
    return;
  }
  if (isNaN(inputAmount) || inputAmount === '') {
    showError('Valor precisa ser número!');
    return;
  }
  // Date validation: must not be after 2100-12-31
  const maxDate = '2100-12-31';
  if (inputDate > maxDate) {
    showError('A data não pode ser após 31/12/2100.');
    return;
  }
  const ok = await createTransaction(inputName, inputDate, inputAmount, inputType, inputCategory, inputComment, inputStatus);
  if (ok) {
    clearInputs();
    await fetchAndRenderTransactions();
    alert('Lançamento adicionado!');
  }
}

/** Function 2 - Send a new transaction to the backend API via POST.
 * Returns true on success, false and shows error on failure. */
async function createTransaction(inputName, inputDate, inputAmount, inputType, inputCategory, inputComment, inputStatus) {
  const formData = new FormData();
  formData.append('name', inputName);
  formData.append('t_date', inputDate);
  formData.append('amount', inputAmount);
  formData.append('t_type', inputType);
  formData.append('category', inputCategory);
  formData.append('comment', inputComment);
  formData.append('t_status', inputStatus ? '1' : '0');
  try {
    const response = await fetch(`${API_BASE}/transaction`, {
      method: 'post',
      body: formData
    });
    if (!response.ok) {
      const data = await response.json();
      showError(data.message || 'Erro ao adicionar lançamento.');
      return false;
    }
    return true;
  } catch (error) {
    showError('Erro ao adicionar lançamento.');
    return false;
  }
}

/** Event 1 - Handles the transaction form submission.
 * Prevents default form behavior and triggers new transaction creation via newItem(). */
document.getElementById('transactionForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  await newItem();
});

/** Function 3 -  Clear all input fields. Resets all transaction form input fields to their default values. */
function clearInputs() {
  document.getElementById('newInput').value = '';
  // Set date to today in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('newDate').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('newAmount').value = '';
  document.getElementById('newType').value = 'expense';
  document.getElementById('newCategory').value = '';
  document.getElementById('newComment').value = '';
  document.getElementById('newStatus').checked = false;
}


///Table Functions
/** Function 4 - Insert a new row into the table with transaction data, with status as checkbox
 * Renders a transaction as a new row in the main table, including delete and status controls. */
function renderTransactionRow(name, t_date, amount, t_type, category, comment, t_status) {
  const table = document.getElementById('mainTable');
  const row = table.insertRow();
  row.insertCell().textContent = name;
  row.insertCell().textContent = formatDateBR(t_date);
  row.insertCell().textContent = formatReal(amount);
  // Entrada/Saída cell with color
  const typeCell = row.insertCell();
  typeCell.textContent = mapType(t_type);
  if (t_type === 'income') {
    typeCell.className = 'cell-income';
  } else if (t_type === 'expense') {
    typeCell.className = 'cell-expense';
  }
  row.insertCell().textContent = mapCategory(category);
  row.insertCell().textContent = comment;
  const statusCell = row.insertCell();
  const statusCheckbox = document.createElement('input');
  statusCheckbox.type = 'checkbox';
  statusCheckbox.checked = !!t_status;
  statusCheckbox.className = 'status-checkbox';
  statusCheckbox.title = 'Alterar status';
  statusCheckbox.addEventListener('change', async function() {
    await updateStatus(name, statusCheckbox.checked);
    await fetchAndRenderTransactions();
  });
  statusCell.appendChild(statusCheckbox);
  // Delete button
  insertButton(row.insertCell());
}

/** Function 5 -  Fetch transactions from server and render in table */
async function fetchAndRenderTransactions() {
  showLoading(true);
  const table = document.getElementById('mainTable');
  // Remove all rows except the header
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
  try {
    const response = await fetch(`${API_BASE}/transactions`);
    const data = await response.json();
    if (!data.transactions || data.transactions.length === 0) {
      table.style.display = 'none';
      updateStats([]);
    } else {
      table.style.display = '';
      // Filter for recent transactions (last N days)
      const now = new Date();
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - TRANSACTION_TABLE_DAYS);
      const visible = data.transactions.filter(item => {
        if (!item.t_date) return false;
        const d = new Date(item.t_date);
        return d >= cutoff;
      });
      visible.forEach(item => {
        renderTransactionRow(
          item.name,
          item.t_date,
          item.amount,
          item.t_type,
          item.category,
          item.comment,
          item.t_status === '1' || item.t_status === 1 || item.t_status === true
        );
      });
      updateStats(data.transactions); // Always sum all for stats
    }
  } catch (error) {
    showError('Erro ao carregar transações.');
    updateStats([]);
  }
  showLoading(false);
}

/** Declaration 1 -  Only show transactions from the last N days in the table, but sum all for stats */
const TRANSACTION_TABLE_DAYS = 90; 


///Updating functions
/** Function 6 -  Updates the status (checked/unchecked) of a transaction by name via PATCH request. */
async function updateStatus(name, newStatus) {
  try {
    await fetch(`${API_BASE}/transaction/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, t_status: newStatus ? 1 : 0 })
    });
  } catch (error) {
    showError('Erro ao atualizar status.');
  }
}

///Delete functions
/** Event 2 -  Handle click events on the table for deleting rows (event delegation) */
document.getElementById('mainTable').addEventListener('click', async function (e) {
  if (e.target.classList.contains('close')) {
    const row = e.target.closest('tr');
    const nameItem = row.getElementsByTagName('td')[0].textContent;
    if (confirm('Você tem certeza?')) {
      await deleteItem(nameItem);
      await fetchAndRenderTransactions();
      alert('Removido!');
    }
  }
});

/** Function 7 -  Deletes a transaction by name via DELETE request to the backend. */
async function deleteItem(item) {
  try {
    await fetch(`${API_BASE}/transaction?name=${encodeURIComponent(item)}`, {
      method: 'delete'
    });
  } catch (error) {
    showError('Erro ao remover lançamento.');
  }
}

/** Function 8 -  Appends a delete (close) button to a table cell. */
function insertButton(parent) {
  const span = document.createElement('span');
  span.className = 'close';
  span.textContent = '\u00D7';
  parent.appendChild(span);
}


/// Options Functions

/** Declaration 2 - List of available transaction categories for dropdown and mapping */ 
const categories = [
  { value: '', label: 'Categoria' },
  { value: 'expenses', label: 'Despesas Gerais' },
  { value: 'gratuities', label: 'Gratificações' },
  { value: 'salaries', label: 'Salários' },
  { value: 'withdrawals', label: 'Saque Banco' },
  { value: 'cash_exchange', label: 'Troco Caixa' },
  { value: 'income', label: 'Venda Caixa' },
  { value: 'otherstores', label: 'Outras Lojas' },
  { value: 'other', label: 'Outros' }
];

/** Declaration 3 - Maps category values to their display labels */
const categoryMap = Object.fromEntries(categories.map(c => [c.value, c.label]));

/** Function 9 -  Maps transaction type to a user-friendly label. */
function mapType(type) {
  return type === 'income' ? 'Entrada' : 'Saída';
}

/** Function 10 - Maps a category value to its display label. */
function mapCategory(cat) {
  return categoryMap[cat] || cat;
}

/** Event 3 - Populates the category dropdown on page load */
document.addEventListener('DOMContentLoaded', function() {
  var categorySelect = document.getElementById('newCategory');
  if (categorySelect) {
    categorySelect.innerHTML = '';
    categories.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      categorySelect.appendChild(option);
    });
  }
});


/// Format Functions
/** Function 11 - Formats a date string (YYYY-MM-DD) as DD/MM/YYYY for display. */
function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}



/** Function 12 - Formats a number as Brazilian Real currency (R$ 0.000,00). */
function formatReal(amount) {
  if (typeof amount === 'string') amount = parseFloat(amount);
  if (isNaN(amount)) return '';
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


/// Extra functions
/** Function 13 - Displays an error message in a banner for 8 seconds. */
function showError(msg) {
  const banner = document.getElementById('errorBanner');
  banner.textContent = msg;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 8000);
}

/** Function 14 - Shows or hides the loading spinner. */
function showLoading(show) {
  document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

/// Balance Cards Functions

/** Function 15 - Updates the stat cards for Entradas, Saídas, and Saldo based on all transactions. */
function updateStats(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(item => {
    // Accept both string and number for amount
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
    if (item.t_type === 'income') {
      totalIncome += amount;
    } else if (item.t_type === 'expense') {
      totalExpense += amount;
    }
  });
  const balance = totalIncome - totalExpense;
  // Update the stat cards
  document.querySelector('.stat-card-income .stat-card-amount').textContent = formatReal(totalIncome);
  document.querySelector('.stat-card-expense .stat-card-amount').textContent = formatReal(totalExpense);
  document.querySelector('.stat-card-balance .stat-card-amount').textContent = formatReal(balance);
}


// Initial population
fetchAndRenderTransactions();
