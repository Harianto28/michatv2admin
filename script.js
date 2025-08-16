// API Configuration
const API_BASE_URL = "http://localhost:3031";

// Data structures matching your API
let devicesData = [];
let accountCredentialsData = [];

// Table state
let currentPage = 1;
let entriesPerPage = 10;
let filteredData = [];
let searchTerm = "";
let currentSection = "devices"; // Track which section is active

// Modal management
let isEditMode = false;
let currentEditId = null;

// DOM elements
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const entriesSelect = document.getElementById("entriesSelect");
const startEntry = document.getElementById("startEntry");
const endEntry = document.getElementById("endEntry");
const totalEntries = document.getElementById("totalEntries");
const pagination = document.getElementById("pagination");
const sectionTitle = document.getElementById("sectionTitle");

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  loadDevices(); // Start with devices section
});

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", function (e) {
    searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    filterData();
    renderTable();
    updatePagination();
    updateEntriesInfo();
  });

  // Entries per page
  entriesSelect.addEventListener("change", function (e) {
    entriesPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
    updatePagination();
    updateEntriesInfo();
  });
}

// Load devices data
async function loadDevices() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      // Get the text response to see what we actually received
      const textResponse = await response.text();
      
      if (textResponse.includes("<!DOCTYPE") || textResponse.includes("<html")) {
        throw new Error("Server returned HTML instead of JSON. This usually means the endpoint doesn't exist or requires authentication.");
      } else {
        throw new Error(`Expected JSON but received: ${contentType || 'unknown content type'}`);
      }
    }

        const data = await response.json();

    devicesData = data;
    currentSection = "devices";
    filteredData = [...devicesData];
    updateSectionTitle("Devices");
    updateTableHeaders();
    renderTable();
    updatePagination();
    updateEntriesInfo();
    updateActiveNav("devices");
    hideLoading();
  } catch (error) {
    console.error("Detailed error loading devices:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showError(
        `CORS Error: Cannot connect to ${API_BASE_URL}/devices. Check if CORS is properly configured on your server.`
      );
    } else {
      showError(`Failed to load devices data: ${error.message}`);
    }
    hideLoading();
  }
}

// Load account credentials data
async function loadAccountCredentials() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/accountCredentials`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    accountCredentialsData = data;
    currentSection = "accounts";
    filteredData = [...accountCredentialsData];
    updateSectionTitle("Account Credentials");
    updateTableHeaders();
    renderTable();
    updatePagination();
    updateEntriesInfo();
    updateActiveNav("accounts");
    hideLoading();
  } catch (error) {
    console.error("Detailed error loading account credentials:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showError(
        `CORS Error: Cannot connect to ${API_BASE_URL}/accountCredentials. Check if CORS is properly configured on your server.`
      );
    } else {
      showError(`Failed to load account credentials data: ${error.message}`);
    }
    hideLoading();
  }
}

// Update section title
function updateSectionTitle(title) {
  if (sectionTitle) {
    sectionTitle.textContent = title;
  }
}

// Update active navigation
function updateActiveNav(section) {
  // Remove active class from all nav links
  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to current section
  const activeLink = document.querySelector(`[data-section="${section}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

// Filter data based on search term
function filterData() {
  if (!searchTerm) {
    filteredData = getCurrentData();
  } else {
    const currentData = getCurrentData();
    filteredData = currentData.filter((item) => {
      // Search across all fields based on current section
      switch (currentSection) {
        case "devices":
          return (
            item.id.toString().includes(searchTerm) ||
            item.device_id.toLowerCase().includes(searchTerm)
          );
        case "accounts":
          return (
            item.id.toString().includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm) ||
            (item.device_id &&
              item.device_id.toLowerCase().includes(searchTerm)) ||
            (item.coordinate &&
              item.coordinate.toLowerCase().includes(searchTerm)) ||
            (item.message &&
              item.message.toLowerCase().includes(searchTerm))
          );
        default:
          return false;
      }
    });
  }
}

// Get current data based on active section
function getCurrentData() {
  let data;
  switch (currentSection) {
    case "devices":
      data = devicesData;
      break;
    case "accounts":
      data = accountCredentialsData;
      break;
    default:
      data = [];
  }
  
  return data;
}

// Render table with current data
function renderTable() {
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  if (pageData.length === 0) {
    const noDataRow = document.createElement("tr");
    let colSpan;
    switch (currentSection) {
      case "devices":
        colSpan = 3; // ID, Device ID, Actions
        break;
      case "accounts":
        colSpan = 7; // ID, Email, Password, Device ID, Coordinate, Message, Actions
        break;
      default:
        colSpan = 6;
    }
    noDataRow.innerHTML = `
            <td colspan="${colSpan}" class="text-center text-muted py-4">
                <i class="fas fa-search fa-2x mb-3"></i>
                <p>No data found matching your search criteria</p>
            </td>
        `;
    tableBody.appendChild(noDataRow);
    return;
  }

  pageData.forEach((item) => {
    const row = document.createElement("tr");

    switch (currentSection) {
      case "devices":
        row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.device_id}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary action-btn" onclick="editItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
        break;
      case "accounts":
        row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.email}</td>
                    <td>${item.password ? "••••••••" : "-"}</td>
                    <td>${item.device_id ? item.device_id : "-"}</td>
                    <td>${item.coordinate ? item.coordinate : "-"}</td>
                    <td>${item.message ? item.message : "-"}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary action-btn" onclick="editItem(${
                          item.id
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteItem(${
                          item.id
                        })">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
        break;
    }

    tableBody.appendChild(row);
  });
}

// Update table headers based on current section
function updateTableHeaders() {
  const thead = document.querySelector("#dataTable thead tr");

  switch (currentSection) {
    case "devices":
      thead.innerHTML = `
                <th>ID</th>
                <th>Device ID</th>
                <th>Actions</th>
            `;
      break;
    case "accounts":
      thead.innerHTML = `
                <th>ID</th>
                <th>Email</th>
                <th>Password</th>
                <th>Device ID</th>
                <th>Coordinate</th>
                <th>Message</th>
                <th>Actions</th>
            `;
      break;
  }
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </a>
    `;
  pagination.appendChild(prevLi);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    const firstLi = document.createElement("li");
    firstLi.className = "page-item";
    firstLi.innerHTML =
      '<a class="page-link" href="#" onclick="changePage(1)">1</a>';
    pagination.appendChild(firstLi);

    if (startPage > 2) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = '<span class="page-link">...</span>';
      pagination.appendChild(ellipsisLi);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
    pagination.appendChild(pageLi);
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = '<span class="page-link">...</span>';
      pagination.appendChild(ellipsisLi);
    }

    const lastLi = document.createElement("li");
    lastLi.className = "page-item";
    lastLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>`;
    pagination.appendChild(lastLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
  pagination.appendChild(nextLi);
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
    updatePagination();
    updateEntriesInfo();
  }
}

// Update entries info
function updateEntriesInfo() {
  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredData.length);

  startEntry.textContent = filteredData.length > 0 ? startIndex : 0;
  endEntry.textContent = endIndex;
  totalEntries.textContent = filteredData.length;
}

// Edit item
function editItem(id) {
  showEditModal(id);
}

// Delete item
function deleteItem(id) {
  showDeleteModal(id);
}





// Loading states
function showLoading() {
  const tableSection = document.querySelector(".table-section");
  tableSection.classList.add("loading");
}

function hideLoading() {
  const tableSection = document.querySelector(".table-section");
  tableSection.classList.remove("loading");
}

function showError(message) {
  // Create a better error display
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger alert-dismissible fade show';
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '20px';
  errorDiv.style.right = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.minWidth = '400px';
  errorDiv.innerHTML = `
    <strong>Error:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}

// Refresh current data
function refreshData() {
  switch (currentSection) {
    case "devices":
      loadDevices();
      break;
    case "accounts":
      loadAccountCredentials();
      break;
  }
}

// Modal management
// Show create modal
function showCreateModal() {
  isEditMode = false;
  currentEditId = null;
  
  // Reset form
  document.getElementById('createEditForm').reset();
  document.getElementById('editItemId').value = '';
  
  // Update modal title
  document.getElementById('createEditModalLabel').textContent = `Create New ${getCurrentSectionTitle()}`;
  
  // Show appropriate form based on current section
  showCurrentSectionForm();
  
  // Load device IDs for account credentials if needed
  if (currentSection === 'accounts') {
    loadDeviceIds();
  }
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
  modal.show();
}

// Show edit modal
function showEditModal(id) {
  isEditMode = true;
  currentEditId = id;
  
  // Get current item data
  const currentData = getCurrentData();
  const item = currentData.find(item => item.id === id);
  
  if (!item) {
    showError('Item not found');
    return;
  }
  
  // Update modal title
  document.getElementById('createEditModalLabel').textContent = `Edit ${getCurrentSectionTitle()}`;
  
  // Show appropriate form based on current section
  showCurrentSectionForm();
  
  // Populate form with current data
  populateFormWithData(item);
  
  // Load device IDs for account credentials if needed
  if (currentSection === 'accounts') {
    loadDeviceIds();
  }
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
  modal.show();
}

// Show current section form
function showCurrentSectionForm() {
  // Hide all forms
  document.getElementById('devicesForm').style.display = 'none';
  document.getElementById('accountsForm').style.display = 'none';
  
  // Show current section form
  switch (currentSection) {
    case 'devices':
      document.getElementById('devicesForm').style.display = 'block';
      break;
    case 'accounts':
      document.getElementById('accountsForm').style.display = 'block';
      break;
  }
}

// Get current section title
function getCurrentSectionTitle() {
  switch (currentSection) {
    case 'devices':
      return 'Device';
    case 'accounts':
      return 'Account Credential';
    default:
      return 'Item';
  }
}

// Populate form with data
function populateFormWithData(item) {
  switch (currentSection) {
    case 'devices':
      document.getElementById('deviceId').value = item.device_id || '';
      break;
    case 'accounts':
      document.getElementById('email').value = item.email || '';
      document.getElementById('password').value = item.password || '';
      document.getElementById('deviceIdSelect').value = item.device_id || '';
      document.getElementById('coordinate').value = item.coordinate || '';
      document.getElementById('message').value = item.message || '';
      break;
  }
}

// Load device IDs for account credentials
async function loadDeviceIds() {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const devices = await response.json();
    const select = document.getElementById('deviceIdSelect');
    
    // Clear existing options
    select.innerHTML = '<option value="">Select Device ID</option>';
    
    // Add device options
    devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.device_id;
      option.textContent = device.device_id;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Failed to load device IDs:', error);
  }
}

// Save item (create or update)
async function saveItem() {
  try {
    let data = {};
    let endpoint = '';
    let method = 'POST';
    
    if (isEditMode) {
      method = 'PUT';
      endpoint = `/${currentSection === 'accounts' ? 'accountCredentials' : currentSection}/${currentEditId}`;
    } else {
      endpoint = `/${currentSection === 'accounts' ? 'accountCredentials' : currentSection}`;
    }
    
    // Build data object based on current section
    switch (currentSection) {
      case 'devices':
        data = {
          device_id: document.getElementById('deviceId').value
        };
        break;
      case 'accounts':
        data = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          device_id: document.getElementById('deviceIdSelect').value,
          coordinate: document.getElementById('coordinate').value,
          message: document.getElementById('message').value
        };
        break;
    }
    
    // Validate required fields
    if (!validateForm(data)) {
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createEditModal'));
    modal.hide();
    
    // Show success message
    showSuccess(result.message || 'Item saved successfully');
    
    // Refresh data from API
    await refreshData();
    
  } catch (error) {
    console.error('Failed to save item:', error);
    showError(`Failed to save item: ${error.message}`);
  }
}

// Validate form data
function validateForm(data) {
  switch (currentSection) {
    case 'devices':
      if (!data.device_id) {
        showError('Device ID is required');
        return false;
      }
      break;
    case 'accounts':
      if (!data.email || !data.password) {
        showError('Email and password are required');
        return false;
      }
      break;
  }
  return true;
}

// Show delete confirmation modal
function showDeleteModal(id) {
  document.getElementById('deleteItemId').textContent = id;
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

// Confirm delete
async function confirmDelete() {
  try {
    const id = document.getElementById('deleteItemId').textContent;
    
    const response = await fetch(`${API_BASE_URL}/${currentSection === 'accounts' ? 'accountCredentials' : currentSection}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    modal.hide();
    
    // Show success message
    showSuccess(result.message || 'Item deleted successfully');
    
    // Refresh data from API instead of just removing from local arrays
    await refreshData();
    
  } catch (error) {
    console.error('Failed to delete item:', error);
    showError(`Failed to delete item: ${error.message}`);
  }
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success alert-dismissible fade show';
  successDiv.style.position = 'fixed';
  successDiv.style.top = '20px';
  successDiv.style.right = '20px';
  successDiv.style.zIndex = '9999';
  successDiv.style.minWidth = '400px';
  successDiv.innerHTML = `
    <strong>Success:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(successDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 5000);
}
