# ByteMe Admin Portal

A modern admin dashboard for managing the ByteMe restaurant platform.

## Features

- **Admin Authentication**: Secure login system for administrators
- **Dashboard Analytics**: Overview of platform statistics including:
  - Total vendors registered
  - Total customers registered
  - Total orders placed
  - Revenue tracking
- **Vendor Management**: View and manage registered vendors
- **Customer Management**: View and manage registered customers
- **Order Management**: Monitor and track customer orders
- **Settings**: Configure admin preferences and system settings

## Getting Started

### Prerequisites

- Node.js 18.x or higher 
- npm or yarn package manager

### Installation

1. Navigate to the admin portal directory:
   ```bash
   cd ByteMe-Admin-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or the next available port).

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Demo Authentication

For demonstration purposes, you can use these credentials:
- **Email**: admin@byteme.com
- **Password**: admin123

## API Integration

The admin portal integrates with the existing ByteMe Node.js API. The following endpoints are used:

- `GET /api/vendors` - Get all vendors
- `GET /api/users` - Get all customers  
- `GET /api/orders` - Get all orders (if available)
- `POST /api/auth/admin/login` - Admin authentication (needs to be implemented)

### Adding Admin Authentication to Backend

To fully integrate the admin portal, add the following endpoint to your ByteMe API:

```javascript
// In authController.js
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes - replace with proper admin authentication
    if (email === 'admin@byteme.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin', email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: { id: 'admin', email, name: 'Admin', role: 'admin' }
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// In authRoutes.js
router.post('/admin/login', loginAdmin);
```

## Technology Stack

- **Frontend**: React 18, Vite 6
- **Styling**: Tailwind CSS 3
- **Icons**: Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.jsx       # Main layout with sidebar
│   ├── ProtectedRoute.jsx
│   └── StatsCard.jsx    # Analytics cards
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state management
├── pages/               # Main application pages
│   ├── Dashboard.jsx    # Analytics dashboard
│   ├── Vendors.jsx      # Vendor management
│   ├── Customers.jsx    # Customer management
│   ├── Orders.jsx       # Order management
│   ├── Settings.jsx     # Admin settings
│   └── Login.jsx        # Authentication page
├── services/            # API integration
│   └── api.js          # HTTP client and service functions
└── App.jsx             # Main application component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in the `components/` directory
2. Add new pages in the `pages/` directory
3. Update routing in `App.jsx`
4. Add API endpoints in `services/api.js`

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Security Considerations

- Implement proper admin authentication in the backend
- Use environment variables for sensitive configuration
- Add rate limiting for API endpoints
- Implement proper session management
- Use HTTPS in production

## Contributing

1. Follow the existing code style and structure
2. Add appropriate error handling
3. Update documentation for new features

4. Test thoroughly before submitting changes
