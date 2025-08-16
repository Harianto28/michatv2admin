# Dashboard with API Integration

A responsive dashboard application built with Bootstrap that connects to your API endpoints and displays data in a table format with search, pagination, and entries control functionality.

## Features

- **API Integration**: Connects to your backend API endpoints
- **Two Data Sections**: Devices and Account Credentials
- **Responsive Design**: Works on desktop and mobile devices
- **Data Table**: Displays data with dynamic columns based on section
- **Search Functionality**: Search through all table data in real-time
- **Pagination**: Navigate through large datasets with configurable page sizes
- **Entries Control**: Choose to show 10, 30, 50, or 100 entries per page
- **Status Badges**: Color-coded status indicators
- **Action Buttons**: Edit and delete functionality for each row
- **Modern UI**: Clean, professional design matching the original dashboard

## ⚠️ IMPORTANT: Setup Required

**Before using this dashboard, you MUST configure your API endpoint URL!**

## Setup Instructions

### 1. Configure API Endpoint

**CRITICAL STEP**: Open `script.js` and update the `API_BASE_URL` constant:

```javascript
// Find this line in script.js (around line 2)
const API_BASE_URL = "http://localhost:3031";

// Change it to match your actual API server URL
const API_BASE_URL = "https://your-api-domain.com";
// OR for local development:
const API_BASE_URL = "http://localhost:3000";
// OR for ngrok:
const API_BASE_URL = "https://your-ngrok-url.ngrok-free.app";
```

**Examples of common API URLs:**
- **Local development**: `http://localhost:3000`
- **Local with different port**: `http://localhost:8080`
- **Ngrok tunnel**: `https://abc123.ngrok-free.app`
- **Production server**: `https://api.yourcompany.com`
- **IP address**: `http://192.168.1.100:3000`

### 2. Verify API Endpoints

Ensure your API server has these endpoints available:

- **`GET /devices`** - Returns list of devices
- **`GET /accountCredentials`** - Returns account credentials with coordinates and messages

### 3. Test API Connection

Before opening the dashboard, test your API endpoints:

```bash
# Test devices endpoint
curl https://your-api-domain.com/devices

# Test account credentials endpoint  
curl https://your-api-domain.com/accountCredentials
```

### 4. Open the Dashboard

1. **Open `index.html`** in your web browser
2. **Check browser console** for any connection errors
3. **Click on different sections** to test data loading

## File Structure

```
michatv2-admin/
├── index.html          # Main HTML file with dashboard layout
├── styles.css          # Custom CSS styling
├── script.js           # JavaScript functionality with API integration
└── README.md           # This file
```

## API Endpoints

The dashboard integrates with the following API endpoints:

- **`GET /devices`** - Fetch all devices (id, device_id)
- **`GET /accountCredentials`** - Fetch account credentials (id, email, password, device_id, coordinate, message)

## Usage

### Navigation

- **Devices**: View all registered devices with their IDs (3 columns: ID, Device ID, Actions)
- **Account Credentials**: View user accounts with email, password, device ID, coordinates, and messages (7 columns)

### Search

- Use the search box to filter data by any field
- Search is performed in real-time as you type
- Search works across all columns for the current section

### Pagination

- Navigate through pages using the pagination controls
- Previous/Next buttons for easy navigation
- Page numbers with ellipsis for large datasets

### Entries per Page

- Select from dropdown: 10, 30, 50, or 100 entries per page
- Automatically resets to first page when changed

### Actions

- **Edit**: Click the edit button (pencil icon) to modify a record
- **Delete**: Click the delete button (trash icon) to remove a record
- **Refresh**: Use the Refresh Data button in the sidebar to reload current data

## API Configuration

### Current Configuration

The dashboard is currently configured to connect to:

```javascript
const API_BASE_URL = "http://localhost:3031";
```

### How to Change API URL

1. **Open `script.js`** in any text editor
2. **Find line 2** where `API_BASE_URL` is defined
3. **Replace the URL** with your actual API server address
4. **Save the file** and refresh your browser

### Common API URL Patterns

| Development Type | Example URL | When to Use |
|------------------|-------------|-------------|
| Local Development | `http://localhost:3000` | Running API on your machine |
| Local with Port | `http://localhost:8080` | API running on different port |
| Ngrok Tunnel | `https://abc123.ngrok-free.app` | Exposing local API to internet |
| Production | `https://api.yourcompany.com` | Live production server |
| IP Address | `http://192.168.1.100:3000` | API on local network |

## Data Structure

**Devices:**

```json
{
  "id": 1,
  "device_id": "device123"
}
```

**Account Credentials:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashedpassword",
  "device_id": "device123",
  "coordinate": "-7.2504,112.7688",
  "message": "Hello! Nice to meet you!"
}
```

## Customization

### Adding New API Endpoints

To add new endpoints, modify the JavaScript file:

1. Add new data loading function:

```javascript
async function loadNewData() {
  try {
    const response = await fetch(`${API_BASE_URL}/newEndpoint`);
    const data = await response.json();
    // Process data...
  } catch (error) {
    console.error("Error loading new data:", error);
  }
}
```

2. Add navigation item in HTML:

```html
<li class="nav-item">
  <a class="nav-link" href="#" data-section="new" onclick="loadNewData()">
    <i class="fas fa-icon"></i>
    New Section
  </a>
</li>
```

### Modifying Table Columns

The table headers automatically update based on the current section. To modify:

1. Update the `updateTableHeaders()` function in `script.js`
2. Update the `renderTable()` function to match your data structure

## Error Handling

The dashboard includes error handling for:

- Network connection issues
- API response errors
- Data loading failures
- Search functionality errors

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- **Bootstrap 5.3.0**: CSS framework for responsive design
- **Font Awesome 6.4.0**: Icons for the interface
- **Vanilla JavaScript**: No additional JavaScript frameworks required

## Responsive Design

The dashboard automatically adapts to different screen sizes:

- **Desktop**: Full sidebar and content layout
- **Tablet**: Responsive table controls
- **Mobile**: Stacked layout with mobile-optimized navigation

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Column-specific filters
- **Bulk Operations**: Select multiple rows for batch actions
- **Data Visualization**: Charts and graphs for data insights
- **User Authentication**: Login/logout functionality
- **Dark Mode**: Theme toggle functionality

## Troubleshooting

### Common Issues

1. **API Connection Failed**

   - **Check your API_BASE_URL** in `script.js` - this is the most common issue!
   - Check if your API server is running
   - Verify the API endpoint URLs are correct
   - Check browser console for CORS errors

2. **Data Not Loading**

   - **Verify API_BASE_URL** is pointing to the correct server
   - Check browser console for error messages
   - Test API endpoints directly with curl or Postman
   - Check network tab for failed requests

3. **Search Not Working**
   - Ensure data is loaded before searching
   - Check if search input field exists
   - Verify JavaScript console for errors

4. **Coordinates and Messages Not Showing**
   - Verify your API returns the `coordinate` and `message` fields
   - Check that field names match exactly (case-sensitive)
   - Ensure API response includes all expected data

### Debug Mode

Enable debug logging by adding this to the browser console:

```javascript
localStorage.setItem("debug", "true");
```

### Testing Your API

Before using the dashboard, test your API endpoints:

```bash
# Test with curl
curl https://your-api-domain.com/accountCredentials

# Test with browser
# Open: https://your-api-domain.com/accountCredentials
# Should return JSON data, not HTML
```

## Support

For questions or issues:

1. **First**: Check that your `API_BASE_URL` is correct in `script.js`
2. Check the browser console for JavaScript errors
3. Verify all files are in the same directory
4. Ensure your API endpoints are accessible
5. Check network connectivity to your API server
6. Test API endpoints directly to ensure they return data

## Quick Start Checklist

- [ ] Update `API_BASE_URL` in `script.js`
- [ ] Verify your API server is running
- [ ] Test API endpoints with curl or browser
- [ ] Open `index.html` in browser
- [ ] Check browser console for errors
- [ ] Click on "Account Credentials" to test data loading
- [ ] Verify coordinates and messages are displayed

## License

This project is open source and available under the MIT License.
