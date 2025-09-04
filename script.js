// API Configuration
const API_BASE_URL = CONFIG.API_BASE_URL;

// Authentication middleware
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    // Not authenticated, redirect to login
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
}

// Data structures matching your API
let devicesData = [];
let accountCredentialsData = [];
let coordinatesData = [];
let messagesData = [];

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
  // Check authentication first
  if (!checkAuth()) {
    return;
  }
  
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

// Load coordinates data
async function loadCoordinates() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/coordinates`, {
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

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn("API returned non-array data for coordinates:", data);
      coordinatesData = [];
    } else {
      coordinatesData = data;
    }
    
    currentSection = "coordinates";
    filteredData = [...coordinatesData];
    updateSectionTitle("Coordinates");
    updateTableHeaders();
    renderTable();
    updatePagination();
    updateEntriesInfo();
    updateActiveNav("coordinates");
    hideLoading();
  } catch (error) {
    console.error("Detailed error loading coordinates:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    // Set empty array on error
    coordinatesData = [];
    filteredData = [];

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showError(
        `CORS Error: Cannot connect to ${API_BASE_URL}/coordinates. Check if CORS is properly configured on your server.`
      );
    } else {
      showError(`Failed to load coordinates data: ${error.message}`);
    }
    hideLoading();
  }
}

// Load messages data
async function loadMessages() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/messages`, {
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

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn("API returned non-array data for messages:", data);
      messagesData = [];
    } else {
      messagesData = data;
    }
    
    currentSection = "messages";
    filteredData = [...messagesData];
    updateSectionTitle("Messages");
    updateTableHeaders();
    renderTable();
    updatePagination();
    updateEntriesInfo();
    updateActiveNav("messages");
    hideLoading();
  } catch (error) {
    console.error("Detailed error loading messages:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    // Set empty array on error
    messagesData = [];
    filteredData = [];

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showError(
        `CORS Error: Cannot connect to ${API_BASE_URL}/messages. Check if CORS is properly configured on your server.`
      );
    } else {
      showError(`Failed to load messages data: ${error.message}`);
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
            item.device_id.toLowerCase().includes(searchTerm) ||
            (item.name && item.name.toLowerCase().includes(searchTerm))
          );
        case "accounts":
          return (
            item.id.toString().includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm) ||
            (item.device_id &&
              item.device_id.toLowerCase().includes(searchTerm))
          );
        case "coordinates":
          return (
            item.id.toString().includes(searchTerm) ||
            item.coordinate.toLowerCase().includes(searchTerm)
          );
        case "messages":
          return (
            item.id.toString().includes(searchTerm) ||
            item.message.toLowerCase().includes(searchTerm)
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
    case "coordinates":
      data = coordinatesData;
      break;
    case "messages":
      data = messagesData;
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
        colSpan = 4; // ID, Device ID, Name, Actions
        break;
      case "accounts":
        colSpan = 5; // ID, Email, Password, Device ID, Actions
        break;
      case "coordinates":
        colSpan = 3; // ID, Coordinate, Actions
        break;
      case "messages":
        colSpan = 3; // ID, Message, Actions
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

  pageData.forEach((item, index) => {
    const row = document.createElement("tr");
    const rowNumber = (currentPage - 1) * entriesPerPage + index + 1;

    switch (currentSection) {
      case "devices":
        row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${item.device_id}</td>
                    <td>${item.name || "-"}</td>
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
                    <td>${rowNumber}</td>
                    <td>${item.email}</td>
                    <td>${item.password ? "••••••••" : "-"}</td>
                    <td>${item.device_name ? item.device_name : (item.device_id ? item.device_id : "-")}</td>
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
      case "coordinates":
        row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${item.coordinate}</td>
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
      case "messages":
        row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${item.message}</td>
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
                <th>No.</th>
                <th>Device ID</th>
                <th>Name</th>
                <th>Actions</th>
            `;
      break;
    case "accounts":
      thead.innerHTML = `
                <th>No.</th>
                <th>Email</th>
                <th>Password</th>
                <th>Device Name</th>
                <th>Actions</th>
            `;
      break;
    case "coordinates":
      thead.innerHTML = `
                <th>No.</th>
                <th>Coordinate</th>
                <th>Actions</th>
            `;
      break;
    case "messages":
      thead.innerHTML = `
                <th>No.</th>
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
    case "coordinates":
      loadCoordinates();
      break;
    case "messages":
      loadMessages();
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
  document.getElementById('coordinatesForm').style.display = 'none';
  document.getElementById('messagesForm').style.display = 'none';
  
  // Show current section form
  switch (currentSection) {
    case 'devices':
      document.getElementById('devicesForm').style.display = 'block';
      break;
    case 'accounts':
      document.getElementById('accountsForm').style.display = 'block';
      break;
    case 'coordinates':
      document.getElementById('coordinatesForm').style.display = 'block';
      break;
    case 'messages':
      document.getElementById('messagesForm').style.display = 'block';
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
    case 'coordinates':
      return 'Coordinate';
    case 'messages':
      return 'Message';
    default:
      return 'Item';
  }
}

// Populate form with data
function populateFormWithData(item) {
  switch (currentSection) {
    case 'devices':
      document.getElementById('deviceId').value = item.device_id || '';
      document.getElementById('deviceName').value = item.name || '';
      break;
    case 'accounts':
      document.getElementById('email').value = item.email || '';
      document.getElementById('password').value = item.password || '';
      document.getElementById('deviceIdSelect').value = item.device_id || '';
      break;
    case 'coordinates':
      document.getElementById('coordinateInput').value = item.coordinate || '';
      break;
    case 'messages':
      document.getElementById('messageInput').value = item.message || '';
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
      option.textContent = device.name || device.device_id; // Show name if available, fallback to device_id
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
          device_id: document.getElementById('deviceId').value,
          name: document.getElementById('deviceName').value
        };
        break;
      case 'accounts':
        data = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          device_id: document.getElementById('deviceIdSelect').value
        };
        break;
      case 'coordinates':
        data = {
          coordinate: document.getElementById('coordinateInput').value
        };
        break;
      case 'messages':
        data = {
          message: document.getElementById('messageInput').value
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
    case 'coordinates':
      if (!data.coordinate) {
        showError('Coordinate is required');
        return false;
      }
      break;
    case 'messages':
      if (!data.message) {
        showError('Message is required');
        return false;
      }
      break;
  }
  return true;
}

// Show delete confirmation modal
function showDeleteModal(id) {
  // Get current item data
  const currentData = getCurrentData();
  const item = currentData.find(item => item.id === id);
  
  if (!item) {
    showError('Item not found');
    return;
  }
  
  // Create meaningful description based on current section
  let itemDescription = '';
  switch (currentSection) {
    case 'devices':
      itemDescription = `Device ID: ${item.device_id}, Name: ${item.name || 'N/A'}`;
      break;
    case 'accounts':
      itemDescription = `Email: ${item.email}, Device: ${item.device_name || item.device_id || 'N/A'}`;
      break;
    case 'coordinates':
      itemDescription = `Coordinate: ${item.coordinate}`;
      break;
    case 'messages':
      itemDescription = `Message: ${item.message}`;
      break;
  }
  
  // Store the actual ID for the delete operation
  document.getElementById('deleteItemId').setAttribute('data-item-id', id);
  document.getElementById('deleteItemId').textContent = itemDescription;
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

// Confirm delete
async function confirmDelete() {
  try {
    const id = document.getElementById('deleteItemId').getAttribute('data-item-id');
    
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

// Batch Insert Functions
function showBatchInsertModal() {
  // Reset form
  document.getElementById('batchData').value = '';
  
  // Update modal title based on current section
  const sectionTitle = getCurrentSectionTitle();
  document.getElementById('batchInsertModalLabel').textContent = `Batch Insert ${sectionTitle}s`;
  
  // Update placeholder based on current section
  const batchDataTextarea = document.getElementById('batchData');
  switch (currentSection) {
    case 'devices':
      batchDataTextarea.placeholder = `device001,Device One
device002,Device Two
device003,Device Three
(device_id,name - both are required)`;
      break;
    case 'accounts':
      batchDataTextarea.placeholder = `user1@example.com,password123,device001
user2@example.com,password456,device002
user3@example.com,password789,device003
(email,password,device_id - all are required)`;
      break;
    case 'coordinates':
      batchDataTextarea.placeholder = `40.7128,-74.0060
34.0522,-118.2437
41.8781,-87.6298
(one coordinate per line)`;
      break;
    case 'messages':
      batchDataTextarea.placeholder = `Hello, this is message 1
Welcome to our system
Thank you for using our service
(one message per line)`;
      break;
  }
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('batchInsertModal'));
  modal.show();
}

function addSampleData() {
  const batchData = document.getElementById('batchData');
  let sampleData = '';
  
  switch (currentSection) {
    case 'devices':
      sampleData = `device001,Device One
device002,Device Two
device003,Device Three`;
      break;
    case 'accounts':
      sampleData = `user1@example.com,password123,device001
user2@example.com,password456,device002
user3@example.com,password789,device003`;
      break;
    case 'coordinates':
      sampleData = `40.7128,-74.0060
34.0522,-118.2437
41.8781,-87.6298`;
      break;
    case 'messages':
      sampleData = `Hello, this is message 1
Welcome to our system
Thank you for using our service`;
      break;
  }
  
  batchData.value = sampleData;
}

async function processBatchInsert() {
  try {
    const batchData = document.getElementById('batchData').value.trim();
    if (!batchData) {
      showError('Please enter some data to insert');
      return;
    }
    
    const lines = batchData.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      showError('No valid data found');
      return;
    }
    
    let endpoint = '';
    let data = {};
    
    switch (currentSection) {
      case 'devices':
        endpoint = '/devices/batch';
        const devices = lines.map(line => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length < 2) {
            throw new Error(`Invalid device format: ${line}. Expected: device_id,name`);
          }
          return {
            device_id: parts[0],
            name: parts[1]
          };
        });
        data = { devices };
        break;
        
      case 'accounts':
        endpoint = '/accountCredentials/batch';
        const credentials = lines.map(line => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length < 3) {
            throw new Error(`Invalid credential format: ${line}. Expected: email,password,device_id`);
          }
          return {
            email: parts[0],
            password: parts[1],
            device_id: parts[2]
          };
        });
        data = { credentials };
        break;
        
      case 'coordinates':
        endpoint = '/coordinates/batch';
        const coordinates = lines.map(line => ({
          coordinate: line.trim()
        }));
        data = { coordinates };
        break;
        
      case 'messages':
        endpoint = '/messages/batch';
        const messages = lines.map(line => ({
          message: line.trim()
        }));
        data = { messages };
        break;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
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
    const modal = bootstrap.Modal.getInstance(document.getElementById('batchInsertModal'));
    modal.hide();
    
    // Show success message
    showSuccess(`${result.count} ${getCurrentSectionTitle()}s created successfully`);
    
    // Refresh data from API
    await refreshData();
    
  } catch (error) {
    console.error('Failed to process batch insert:', error);
    showError(`Failed to process batch insert: ${error.message}`);
  }
}
