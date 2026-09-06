// Base URL of the Spring Boot backend
const API_BASE = 'http://localhost:8080/api/customers';

// DOM references
const form = document.getElementById('customerForm');
const formTitle = document.getElementById('formTitle');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const customerIdField = document.getElementById('customerId');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const phoneField = document.getElementById('phone');
const companyField = document.getElementById('company');
const statusField = document.getElementById('status');

const tableBody = document.getElementById('customerTableBody');
const emptyState = document.getElementById('emptyState');

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refreshBtn');

let isEditing = false;

// ---------- Data loading ----------

async function loadCustomers() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to load customers');
    const customers = await response.json();
    renderTable(customers);
    updateSummary(customers);
  } catch (err) {
    showMessage('Could not load customers. Is the backend running?', 'error');
    console.error(err);
  }
}

function updateSummary(customers) {
  document.getElementById('totalCount').textContent = customers.length;
  document.getElementById('leadCount').textContent = customers.filter(c => c.status === 'LEAD').length;
  document.getElementById('activeCount').textContent = customers.filter(c => c.status === 'ACTIVE').length;
  document.getElementById('inactiveCount').textContent = customers.filter(c => c.status === 'INACTIVE').length;
}

function renderTable(customers) {
  tableBody.innerHTML = '';

  if (!customers || customers.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  customers.forEach(customer => {
    const row = document.createElement('tr');
    const createdDate = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-';

    row.innerHTML = `
      <td>${escapeHtml(customer.name)}</td>
      <td>${escapeHtml(customer.email)}</td>
      <td>${escapeHtml(customer.phone || '-')}</td>
      <td>${escapeHtml(customer.company || '-')}</td>
      <td><span class="status-badge status-${customer.status}">${customer.status}</span></td>
      <td>${createdDate}</td>
      <td>
        <button class="btn-small btn-edit" data-id="${customer.id}">Edit</button>
        <button class="btn-small btn-delete" data-id="${customer.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up edit/delete buttons after rendering
  document.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', () => startEdit(btn.dataset.id))
  );
  document.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', () => deleteCustomer(btn.dataset.id))
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Create / Update ----------

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    phone: phoneField.value.trim(),
    company: companyField.value.trim(),
    status: statusField.value
  };

  try {
    let response;
    if (isEditing) {
      response = await fetch(`${API_BASE}/${customerIdField.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Request failed. Check the required fields.');
    }

    showMessage(isEditing ? 'Customer updated successfully.' : 'Customer added successfully.', 'success');
    resetForm();
    loadCustomers();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

async function startEdit(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Customer not found');
    const customer = await response.json();

    customerIdField.value = customer.id;
    nameField.value = customer.name;
    emailField.value = customer.email;
    phoneField.value = customer.phone || '';
    companyField.value = customer.company || '';
    statusField.value = customer.status;

    isEditing = true;
    formTitle.textContent = 'Edit Customer';
    submitBtn.textContent = 'Update Customer';
    cancelEditBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  customerIdField.value = '';
  isEditing = false;
  formTitle.textContent = 'Add New Customer';
  submitBtn.textContent = 'Add Customer';
  cancelEditBtn.style.display = 'none';
}

// ---------- Delete ----------

async function deleteCustomer(id) {
  if (!confirm('Delete this customer? This cannot be undone.')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete customer');
    showMessage('Customer deleted.', 'success');
    loadCustomers();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ---------- Search & Filter ----------

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(handleSearchOrFilter, 300);
});

statusFilter.addEventListener('change', handleSearchOrFilter);
refreshBtn.addEventListener('click', () => {
  searchInput.value = '';
  statusFilter.value = '';
  loadCustomers();
});

async function handleSearchOrFilter() {
  const name = searchInput.value.trim();
  const status = statusFilter.value;

  try {
    let url = API_BASE;
    if (name) {
      url = `${API_BASE}/search?name=${encodeURIComponent(name)}`;
    } else if (status) {
      url = `${API_BASE}/filter?status=${encodeURIComponent(status)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Search failed');
    const customers = await response.json();
    renderTable(customers);
    updateSummary(customers);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ---------- Helpers ----------

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
  setTimeout(() => {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }, 4000);
}

// Initial load
loadCustomers();
