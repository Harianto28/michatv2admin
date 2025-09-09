// API Configuration
console.log("CONFIG object:", CONFIG);
console.log("CONFIG.API_BASE_URL:", CONFIG.API_BASE_URL);
const API_BASE_URL = CONFIG.API_BASE_URL;
console.log("API_BASE_URL set to:", API_BASE_URL);

// JWT Token Management
function getStoredToken() {
  return localStorage.getItem("jwtToken");
}

function setStoredToken(token) {
  localStorage.setItem("jwtToken", token);
}

function removeStoredToken() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
}

function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
}

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  setupLoginForm();
});

// Check authentication status
function checkAuthStatus() {
  const token = getStoredToken();
  const userData = localStorage.getItem("userData");

  if (token && userData && !isTokenExpired(token)) {
    // User is already logged in with valid token, redirect to dashboard
    window.location.href = "index.html";
  }
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showAlert("Please enter both username and password", "danger");
      return;
    }

    await login(username, password);
  });
}

// Login function
async function login(username, password) {
  try {
    setLoading(true);

    const loginUrl = `${API_BASE_URL}/login`;
    console.log("Attempting to login to:", loginUrl);

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      mode: "cors",
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok && data.success) {
      // Extract token and user data from the response
      const token = data.data?.token;
      const userData = data.data?.user;

      console.log("Token found:", token);
      console.log("User data:", userData);

      if (token) {
        // Login successful
        showAlert("Login successful! Redirecting...", "success");

        // Store JWT token and user data
        setStoredToken(token);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        // Login failed - no token
        showAlert("Login failed - no token received", "danger");
      }
    } else {
      // Login failed
      showAlert(data.message || "Login failed", "danger");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Connection error. Please try again.", "danger");
  } finally {
    setLoading(false);
  }
}

// Show alert message
function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  alertContainer.innerHTML = "";
  alertContainer.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Set loading state
function setLoading(loading) {
  const loginBtn = document.getElementById("loginBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const loginText = document.getElementById("loginText");

  if (loading) {
    loginBtn.disabled = true;
    loadingSpinner.classList.add("show");
    loginText.textContent = "Logging in...";
  } else {
    loginBtn.disabled = false;
    loadingSpinner.classList.remove("show");
    loginText.textContent = "Login";
  }
}
