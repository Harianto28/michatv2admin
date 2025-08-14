# Dashboard with API Integration

A responsive dashboard application built with Bootstrap that connects to your API endpoints and displays data in a table format with search, pagination, and entries control functionality.

## Features

- **API Integration**: Connects to your backend API endpoints
- **Three Data Sections**: Devices, Account Credentials, and People Nearby
- **Responsive Design**: Works on desktop and mobile devices
- **Data Table**: Displays data with dynamic columns based on section
- **Search Functionality**: Search through all table data in real-time
- **Pagination**: Navigate through large datasets with configurable page sizes
- **Entries Control**: Choose to show 10, 30, 50, or 100 entries per page
- **Status Badges**: Color-coded status indicators
- **Action Buttons**: Edit and delete functionality for each row
- **Modern UI**: Clean, professional design matching the original dashboard
- **CSV Export**: Export data to CSV format

## API Endpoints

The dashboard integrates with the following API endpoints:

- **`GET /devices`** - Fetch all devices (id, device_id)
- **`GET /accountCredentials`** - Fetch account credentials (id, email, password, device_id)
- **`GET /peopleNearbyCredentials`** - Fetch people nearby (id, profile_id, account_id)

## File Structure

```
michatv2-admin/
├── index.html          # Main HTML file with dashboard layout
├── styles.css          # Custom CSS styling
├── script.js           # JavaScript functionality with API integration
└── README.md           # This file
```

## Getting Started

1. **Open the Dashboard**: Simply open `index.html` in your web browser
2. **API Connection**: The dashboard will automatically connect to your API at `https://3ba753b7a9c1.ngrok-free.app`
3. **Data Loading**: Data is fetched from your API endpoints when you click on each section

## Usage

### Navigation

- **Devices**: View all registered devices with their IDs
- **Account Credentials**: View user accounts with email, password, and associated device IDs
- **People Nearby**: View people nearby credentials with profile and account IDs

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
- **Export**: Click the Export button to download data as CSV
- **Refresh**: Use the Refresh Data button in the sidebar to reload current data

## API Configuration

The dashboard is configured to connect to your API at:

```javascript
const API_BASE_URL = "https://3ba753b7a9c1.ngrok-free.app";
```

### Data Structure

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
  "device_id": "device123"
}
```

**People Nearby:**

```json
{
  "id": 1,
  "profile_id": 123,
  "account_id": 456
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

   - Check if your API server is running
   - Verify the API_BASE_URL in script.js
   - Check browser console for CORS errors

2. **Data Not Loading**

   - Check browser console for error messages
   - Verify API endpoint responses
   - Check network tab for failed requests

3. **Search Not Working**
   - Ensure data is loaded before searching
   - Check if search input field exists
   - Verify JavaScript console for errors

### Debug Mode

Enable debug logging by adding this to the browser console:

```javascript
localStorage.setItem("debug", "true");
```

## Support

For questions or issues:

1. Check the browser console for JavaScript errors
2. Verify all files are in the same directory
3. Ensure your API endpoints are accessible
4. Check network connectivity to your API server

## License

This project is open source and available under the MIT License.
