// API Configuration
const API_BASE_URL = "https://108bf6894af0.ngrok-free.app";

// Data structures matching your API
let devicesData = [];
let accountCredentialsData = [];
let peopleNearbyData = [];

// Table state
let currentPage = 1;
let entriesPerPage = 10;
let filteredData = [];
let searchTerm = "";
let currentSection = "devices"; // Track which section is active

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
    console.log(`Attempting to fetch from: ${API_BASE_URL}/devices`);

    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data);

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
    console.log(`Attempting to fetch from: ${API_BASE_URL}/accountCredentials`);

    const response = await fetch(`${API_BASE_URL}/accountCredentials`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data);

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

// Load people nearby data
async function loadPeopleNearby() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/peopleNearbyCredentials`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    peopleNearbyData = await response.json();
    currentSection = "nearby";
    filteredData = [...peopleNearbyData];
    updateSectionTitle("People Nearby");
    updateTableHeaders();
    renderTable();
    updatePagination();
    updateEntriesInfo();
    updateActiveNav("nearby");
    hideLoading();
  } catch (error) {
    console.error("Error loading people nearby:", error);
    showError("Failed to load people nearby data");
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
              item.device_id.toLowerCase().includes(searchTerm))
          );
        case "nearby":
          return (
            item.id.toString().includes(searchTerm) ||
            item.profile_id.toString().includes(searchTerm) ||
            item.account_id.toString().includes(searchTerm)
          );
        default:
          return false;
      }
    });
  }
}

// Get current data based on active section
function getCurrentData() {
  switch (currentSection) {
    case "devices":
      return devicesData;
    case "accounts":
      return accountCredentialsData;
    case "nearby":
      return peopleNearbyData;
    default:
      return [];
  }
}

// Render table with current data
function renderTable() {
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  if (pageData.length === 0) {
    const noDataRow = document.createElement("tr");
    noDataRow.innerHTML = `
            <td colspan="6" class="text-center text-muted py-4">
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
                    <td>-</td>
                    <td><span class="status-active">Active</span></td>
                    <td>-</td>
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
                    <td>-</td>
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
      case "nearby":
        row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.profile_id}</td>
                    <td>${item.account_id}</td>
                    <td>-</td>
                    <td>-</td>
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
                <th>ID</th>
                <th>Device ID</th>
                <th>-</th>
                <th>Status</th>
                <th>-</th>
                <th>Actions</th>
            `;
      break;
    case "accounts":
      thead.innerHTML = `
                <th>ID</th>
                <th>Email</th>
                <th>Password</th>
                <th>Device ID</th>
                <th>-</th>
                <th>Actions</th>
            `;
      break;
    case "nearby":
      thead.innerHTML = `
                <th>ID</th>
                <th>Profile ID</th>
                <th>Account ID</th>
                <th>-</th>
                <th>-</th>
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

// Edit item (placeholder function)
function editItem(id) {
  alert(`Edit item with ID: ${id} in ${currentSection} section`);
  // Implement your edit functionality here
}

// Delete item (placeholder function)
function deleteItem(id) {
  if (confirm(`Are you sure you want to delete item with ID: ${id}?`)) {
    // Remove from data
    switch (currentSection) {
      case "devices":
        devicesData = devicesData.filter((item) => item.id !== id);
        break;
      case "accounts":
        accountCredentialsData = accountCredentialsData.filter(
          (item) => item.id !== id
        );
        break;
      case "nearby":
        peopleNearbyData = peopleNearbyData.filter((item) => item.id !== id);
        break;
    }

    filteredData = filteredData.filter((item) => item.id !== id);

    // Recalculate pagination
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    // Update table
    renderTable();
    updatePagination();
    updateEntriesInfo();

    alert("Item deleted successfully!");
  }
}

// Export functionality
document.addEventListener("DOMContentLoaded", function () {
  const exportBtn = document.querySelector(".action-buttons .btn:nth-child(2)");
  exportBtn.addEventListener("click", function () {
    exportToCSV();
  });
});

// Share functionality
document.addEventListener("DOMContentLoaded", function () {
  const shareBtn = document.querySelector(".action-buttons .btn:nth-child(1)");
  shareBtn.addEventListener("click", function () {
    alert("Share functionality - implement based on your needs");
  });
});

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const themeBtn = document.querySelector(".floating-action-btn .btn");
  themeBtn.addEventListener("click", function () {
    alert("Theme toggle functionality - implement based on your needs");
  });
});

// Export to CSV
function exportToCSV() {
  const currentData = getCurrentData();
  if (currentData.length === 0) {
    alert("No data to export");
    return;
  }

  let csvContent = "";
  let headers = "";
  let rows = "";

  switch (currentSection) {
    case "devices":
      headers = "ID,Device ID\n";
      rows = currentData
        .map((item) => `${item.id},${item.device_id}`)
        .join("\n");
      break;
    case "accounts":
      headers = "ID,Email,Password,Device ID\n";
      rows = currentData
        .map(
          (item) =>
            `${item.id},${item.email},${item.password || ""},${
              item.device_id || ""
            }`
        )
        .join("\n");
      break;
    case "nearby":
      headers = "ID,Profile ID,Account ID\n";
      rows = currentData
        .map((item) => `${item.id},${item.profile_id},${item.account_id}`)
        .join("\n");
      break;
  }

  csvContent = headers + rows;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${currentSection}_data.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  alert(message); // You can replace this with a better error display
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
    case "nearby":
      loadPeopleNearby();
      break;
  }
}
