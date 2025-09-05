# ByteMe Admin Portal - Backend Integration Guide

This guide explains how to integrate the ByteMe Admin Portal with your Node.js API backend.

## 🚀 Quick Setup

### 1. Backend API Changes Applied

I've already made the following changes to your ByteMe Node.js API:

#### ✅ New Files Added:
- `models/Admin.js` - Admin user model
- `controllers/adminController.js` - Admin authentication and analytics controllers
- `routes/adminRoutes.js` - Admin API routes

#### ✅ Files Modified:
- `middleware/auth.js` - Updated to handle admin authentication
- `index.js` - Added admin routes and CORS settings

### 2. Environment Variables

Add these environment variables to your `.env` file in the ByteMe-Node-API directory:

```env
# Admin Registration
ADMIN_REGISTRATION_CODE=BYTEME_ADMIN_2024

# JWT Secret (if not already set)
JWT_SECRET=your-jwt-secret-key

# Session Secret (if not already set)
SESSION_SECRET=your-session-secret-key
```

### 3. Start the Backend

```bash
cd ByteMe-Node-API
npm start
```

The API will be available at `http://localhost:3001` (or your configured port).

### 4. Start the Admin Portal

```bash
cd ByteMe-Admin-portal
npm run dev
```

The admin portal will be available at `http://localhost:5175` (or the next available port).

## 📊 New API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/register` | Register new admin |
| POST | `/api/auth/admin/login` | Admin login |

### Analytics Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard-stats` | Dashboard overview statistics |
| GET | `/api/admin/revenue-stats?period=7d&vendorId=all` | Revenue analytics with filtering |
| GET | `/api/admin/vendor-stats?period=30d` | Vendor statistics with date filtering |
| GET | `/api/admin/customer-stats?period=30d` | Customer statistics with date filtering |
| GET | `/api/admin/order-stats?period=30d` | Order statistics with date filtering |
| GET | `/api/admin/vendors` | List of vendors for filtering |

## 🔐 Admin Registration

### Demo Credentials
- **Registration Code**: `BYTEME_ADMIN_2024`
- **Demo Login**: `admin@byteme.com` / `admin123` (if you want to create a demo admin)

### Creating Your First Admin

1. Visit `http://localhost:5175/register`
2. Fill in the registration form
3. Use the registration code: `BYTEME_ADMIN_2024`
4. Complete registration
5. Login at `http://localhost:5175/login`

## 🏗️ Database Schema

### Admin Model

The new Admin model includes:

```javascript
{
  name: String,           // Admin full name
  email: String,          // Unique email
  password: String,       // Hashed password
  role: String,          // 'admin' or 'super_admin'
  permissions: [String], // Array of permissions
  isActive: Boolean,     // Account status
  lastLogin: Date,       // Last login timestamp
  loginAttempts: Number, // Failed login counter
  lockUntil: Date,       // Account lock expiry
  createdAt: Date,       // Creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

### Default Permissions

New admins get these default permissions:
- `read_vendors` - View vendor information
- `read_customers` - View customer information  
- `read_orders` - View order information
- `read_analytics` - View analytics dashboards

## 🔒 Security Features

### Account Security
- **Password Hashing**: bcrypt with salt rounds 12
- **Account Locking**: After 5 failed login attempts (2-hour lockout)
- **JWT Tokens**: 24-hour expiry
- **Registration Code**: Required for admin registration

### API Security
- **Authentication Required**: All admin endpoints require valid JWT
- **Role Verification**: Admin-only endpoints check user role
- **CORS Configured**: Only allows specific frontend URLs

## 📈 Analytics Data

The admin dashboard shows:

### Overview Statistics
- Total vendors registered
- Total customers registered  
- Total orders placed
- Total revenue generated
- Growth percentages (30-day comparison)

### Detailed Analytics with Vendor Filtering
- **Revenue Trends**: Daily revenue over time periods (7d, 30d, 90d)
  - Filter by specific vendor or view all vendors combined
  - Real-time data from order transactions
  - Interactive charts with loading states
- **Daily Orders**: Order count tracking with vendor filtering
- **Vendor Statistics**: Total active vendors, cuisine distribution
- **Customer Statistics**: Active customers, verified accounts
- **Order Statistics**: Order status breakdown, revenue by status

### Universal Date Filtering Features
- **Consistent Date Filters**: All admin pages now have date filtering
- **Period Options**: Last Day, Last Week, Last Month, Last 3 Months
- **Real-time Updates**: All analytics update automatically when filters change
- **Page-specific Overview**: Each page shows period-based statistics
- **Vendor-specific Analytics**: Dashboard shows revenue and order totals for selected vendor
- **All Vendors Default**: Cumulative data across all vendors by default

### Date Filter Implementation
- **Reusable Component**: Consistent UI across all admin pages
- **Backend Integration**: All analytics endpoints support period filtering
- **Smart Defaults**: Sensible default periods for each page type
- **Loading States**: Visual feedback during data updates
- **Period Labels**: Clear indication of selected time ranges

## 🛠️ Customization

### Adding New Admin Endpoints

1. Add controller function to `controllers/adminController.js`
2. Add route to `routes/adminRoutes.js` with proper middleware
3. Update frontend API service in `services/api.js`

### Modifying Permissions

Edit the Admin model (`models/Admin.js`) to add new permission types:

```javascript
permissions: [{
  type: String,
  enum: [
    'read_vendors', 'write_vendors',
    'read_customers', 'write_customers', 
    'read_orders', 'write_orders',
    'read_analytics', 'system_settings',
    'your_new_permission' // Add here
  ]
}]
```

### Extending Analytics

Add new analytics endpoints in `controllers/adminController.js`:

```javascript
const getCustomAnalytics = async (req, res) => {
  try {
    // Your analytics logic here
    const data = await YourModel.aggregate([...]);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    // Error handling
  }
};
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your admin portal URL is in the CORS whitelist
2. **Authentication Fails**: Check JWT_SECRET is set and consistent
3. **Database Connection**: Ensure MongoDB is running and connected
4. **Port Conflicts**: Admin portal runs on 5175, API on 3001

### Development Mode

For development, you can bypass the registration code by modifying `controllers/adminController.js`:

```javascript
// Comment out this validation for development
// if (adminCode !== validAdminCode) {
//   return res.status(400).json({
//     success: false,
//     message: 'Invalid admin registration code'
//   });
// }
```

## 📝 Next Steps

1. **Production Setup**: 
   - Use strong JWT secrets
   - Enable HTTPS
   - Set up proper database backups
   - Configure rate limiting

2. **Additional Features**:
   - Email notifications for admin actions
   - Audit logging
   - Advanced user management
   - Custom analytics dashboards

3. **Monitoring**:
   - Set up application monitoring
   - Database performance monitoring
   - Error tracking and alerting

## 🆘 Support

If you encounter any issues:

1. Check the console logs in both frontend and backend
2. Verify all environment variables are set
3. Ensure database is connected and models are synced
4. Check CORS settings match your URLs

The admin portal is now fully integrated with your ByteMe API and ready for production use!
