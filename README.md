# POS System - Cooperative Sales System

A comprehensive Point of Sale (POS) system with user authentication and cart persistence, built with Next.js, MongoDB, and TailwindCSS.

## 🚀 Key Features

✅ **User Authentication**: Secure login system with role-based access (Admin/Staff)  
✅ **Cart Persistence**: Unpaid cart items persist across sessions and devices  
✅ **Member Auto-Registration**: Automatically add new members if not found  
✅ **Barcode Scanning**: Quick product lookup by Product ID  
✅ **Multi-Product Cart**: Add multiple products with quantity control  
✅ **Payment Calculation**: Automatic change calculation  
✅ **Transaction Recording**: All sales saved to database  
✅ **Transaction History**: Filter by day, month, or all time  
✅ **Revenue Analytics**: View total revenue and transaction statistics  
✅ **Responsive Design**: Works on desktop and mobile devices  
✅ **Protected Routes**: Middleware-based authentication for secure access

## Project Flow

### 0. **User Authentication (Login Page)**

- **Login Page** (`/login`):
  - Staff/Admin enters username and password
  - System validates credentials against User database
  - Successful login stores user info in localStorage and cookies
  - Redirects to Member Login page
  - Failed login shows error message
- **Protected Routes**:
  - All pages except `/login` require authentication
  - Middleware automatically redirects unauthenticated users to login
  - Logged-in users trying to access `/login` are redirected to main page

### 1. **Member Login/Registration (Main Page)**

- User enters their Member ID
- System checks if member exists in database
- **If member exists**: Redirects to Purchase Page with member data
- **If member doesn't exist**: Shows registration form to add new member
  - User fills in: Member Name, Level (Regular/Silver/Gold/Platinum), Avatar URL
  - Member is automatically added to database
  - Redirects to Purchase Page

### 2. **Purchase Page (POS Interface)**

- Displays current member information (Name, ID, Level)
- **Cart Persistence**:
  - Automatically loads unpaid cart items from server for the member
  - Cart syncs across different devices and sessions
  - Items remain in cart until payment is completed or cancelled
- **Barcode Scanning Section**:
  - Input field for scanning/entering product barcode (Product ID)
  - Automatically searches product in database
  - Adds product to cart or increases quantity if already in cart
  - Cart updates are saved to server in real-time
- **Shopping Cart**:
  - Shows all scanned products with:
    - Product ID, Name, Price
    - Quantity controls (+/- buttons)
    - Subtotal for each item
    - Remove button
  - Real-time total calculation
  - Auto-saves to server on every change
- **Checkout Process**:
  - Click "Checkout" button
  - Payment modal appears
  - Enter amount paid
  - System automatically calculates change
  - Validates payment (must be >= total)
  - Saves transaction to database
  - Clears cart from server (marks as completed)
  - Option to continue shopping or return to home

### 3. **Transaction History Page**

- View all transactions with filtering options:
  - **Daily**: View transactions for a specific day
  - **Monthly**: View transactions for a specific month
  - **All Time**: View all transactions
- **Summary Cards**:
  - Total number of transactions
  - Total revenue
  - Average transaction value
- **Transaction Table**:
  - Transaction ID, Date & Time
  - Member information
  - Number of items
  - Total, Paid, and Change amounts
  - "View Details" button for each transaction
- **Transaction Details Modal**:
  - Complete transaction information
  - List of all products purchased
  - Payment summary

### 4. **Product Management**

- Add new products to inventory
- View all products
- Delete products
- Each product has: ID, Name, Price, Amount (stock)

### 5. **Member Management**

- Add new members manually
- Edit member information
- Delete members
- View all members with their levels

## Database Models

### User (Authentication)

```javascript
{
  username: String (unique, required),
  password: String (required, plain text),
  role: String (enum: ["admin", "staff"], default: "staff"),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Cart (Persistence)

```javascript
{
  member_id: String (required, indexed),
  member_name: String (required),
  items: [{
    _id: String,
    product_id: String,
    product_name: String,
    price: Number,
    quantity: Number
  }],
  total_amount: Number (default: 0),
  status: String (enum: ["pending", "completed", "cancelled"], default: "pending"),
  last_updated: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Member

```javascript
{
  member_id: Number (unique),
  member_name: String,
  level: String,
  avatar: String
}
```

### Product

```javascript
{
  product_id: Number (unique),
  product_name: String,
  price: Number,
  amount: Number
}
```

### Transaction

```javascript
{
  transaction_id: String (unique),
  member_id: Number,
  member_name: String,
  products: [{
    product_id: Number,
    product_name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  total_amount: Number,
  paid_amount: Number,
  change_amount: Number,
  transaction_date: Date
}
```

## API Routes

### Authentication

- `POST /api/auth/login` - User login (validates credentials, returns user data)

### Cart

- `GET /api/cart?member_id=[id]` - Get cart for specific member
- `POST /api/cart` - Save/update cart for member
- `DELETE /api/cart?member_id=[id]` - Clear cart for member

### Members

- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `GET /api/members/[id]` - Get member by ID
- `PUT /api/members/[id]` - Update member
- `DELETE /api/members?id=[id]` - Delete member

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `DELETE /api/products?id=[id]` - Delete product

### Transactions

- `GET /api/transactions?filter=[day|month|all]&date=[date]` - Get filtered transactions
- `POST /api/transactions` - Create new transaction

## How to Use

### First Time Setup

1. **Create Admin User** (See `MANUAL_USER_CREATION.md` for detailed instructions):
   - Use MongoDB Compass, MongoDB Shell, or Node.js script
   - Create user with username and password
   - Example: `{ username: "admin", password: "admin123", role: "admin", isActive: true }`

2. **Access the System**:
   - Open [http://localhost:3000/login](http://localhost:3000/login)
   - Login with your created credentials
   - System redirects to Member Login page

### Daily Operations

1. **Start a Sale**:
   - After staff login, enter Member ID on main page
   - If new member, fill registration form
   - You'll be redirected to Purchase Page
   - Any unpaid items from previous sessions will automatically load

2. **Scan Products**:
   - Enter or scan Product ID (barcode)
   - Product automatically added to cart
   - Adjust quantities as needed
   - Cart auto-saves to server

3. **Complete Payment**:
   - Click "Checkout"
   - Enter amount paid
   - System shows change amount
   - Confirm payment to save transaction
   - Cart is cleared from server

4. **View Transactions**:
   - Navigate to "Transactions" from menu
   - Select filter (Daily/Monthly/All Time)
   - View transaction details

## Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS, DaisyUI
- **Backend**: Next.js API Routes, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Middleware-based with localStorage and cookies
- **State Management**: React Hooks (useState, useEffect)
- **UI Components**: SweetAlert2 for notifications
- **HTTP Client**: Axios
- **Utilities**: XLSX for data export

## Installation

1. **Clone the repository** (if applicable)

2. **Install dependencies**:

```bash
npm install
```

3. **Set up MongoDB connection** in `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
```

4. **Create initial admin user** (see `MANUAL_USER_CREATION.md`)

5. **Run development server**:

```bash
npm run dev
```

6. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to `/login`
   - Login with your admin credentials

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/         # User authentication
│   │   ├── cart/              # Cart persistence
│   │   ├── members/           # Member CRUD
│   │   ├── products/          # Product CRUD
│   │   └── transactions/      # Transaction management
│   ├── components/
│   │   ├── daily/             # Transaction History
│   │   ├── footer/            # Footer component
│   │   ├── main/              # Member Login
│   │   ├── member/            # Member Management
│   │   ├── navbar/            # Navigation bar
│   │   └── product/           # Product Management
│   ├── login/                 # Staff/Admin Login Page
│   ├── purchase/              # POS Purchase Page
│   ├── layout.js              # Root layout
│   ├── globals.css            # Global styles
│   └── page.js                # Home Page (redirects)
├── models/
│   ├── User.js                # User authentication model
│   ├── Cart.js                # Cart persistence model
│   ├── members.js             # Member model
│   ├── products.js            # Product model
│   └── transactions.js        # Transaction model
├── libs/
│   └── mongodb.js             # MongoDB connection
├── scripts/
│   └── createUser.js          # User creation script
├── middleware.js              # Authentication middleware
├── .env                       # Environment variables
├── README.md                  # This file
└── MANUAL_USER_CREATION.md    # User setup guide
```

## Security Notes

⚠️ **Important Security Information**:

- **Password Storage**: Passwords are currently stored in **plain text** (not hashed)
- **Intended Use**: This system is designed for **internal use only** in a trusted environment
- **Not Production-Ready**: Do NOT deploy this to public internet without implementing proper security measures

🔐 **Recommended Security Improvements for Production**:

1. Implement password hashing with bcrypt
2. Add JWT-based session management
3. Implement HTTPS/SSL
4. Add rate limiting for login attempts
5. Implement password reset functionality
6. Add input validation and sanitization
7. Implement CSRF protection

## Additional Notes

- Product ID serves as the barcode for scanning
- User session data is stored in localStorage and cookies
- Member data is stored in localStorage during active session
- Cart data persists in MongoDB and syncs across devices
- All monetary values are displayed with 2 decimal places
- Transactions are timestamped automatically
- Change is calculated and displayed in real-time during payment
- Unpaid carts are automatically loaded when member logs in
- Cart is cleared from server only after successful payment

## Documentation

- **User Creation Guide**: See `MANUAL_USER_CREATION.md` for detailed instructions on creating admin and staff users
- **API Documentation**: API routes are documented in this README under "API Routes" section

## Support

For issues or questions:

1. Check `MANUAL_USER_CREATION.md` for user setup issues
2. Verify MongoDB connection in `.env`
3. Check browser console for client-side errors
4. Check server logs for API errors

---

© 2026 Cooperative Sales System
