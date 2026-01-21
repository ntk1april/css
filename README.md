# POS System - Point of Sale Application

A comprehensive Point of Sale (POS) system built with Next.js, MongoDB, and TailwindCSS.

## Project Flow

### 1. **Member Login/Registration (Home Page)**

- User enters their Member ID
- System checks if member exists in database
- **If member exists**: Redirects to Purchase Page with member data
- **If member doesn't exist**: Shows registration form to add new member
  - User fills in: Member Name, Level (Regular/Silver/Gold/Platinum), Avatar URL
  - Member is automatically added to database
  - Redirects to Purchase Page

### 2. **Purchase Page (POS Interface)**

- Displays current member information (Name, ID, Level)
- **Barcode Scanning Section**:
  - Input field for scanning/entering product barcode (Product ID)
  - Automatically searches product in database
  - Adds product to cart or increases quantity if already in cart
- **Shopping Cart**:
  - Shows all scanned products with:
    - Product ID, Name, Price
    - Quantity controls (+/- buttons)
    - Subtotal for each item
    - Remove button
  - Real-time total calculation
- **Checkout Process**:
  - Click "Checkout" button
  - Payment modal appears
  - Enter amount paid
  - System automatically calculates change
  - Validates payment (must be >= total)
  - Saves transaction to database
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
- Each product has: ID, Name, Price, Amount (stock)

### 5. **Member Management**

- Add new members manually
- Edit member information
- Delete members
- View all members with their levels

## Database Models

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

## Features

✅ **Member Auto-Registration**: Automatically add new members if not found
✅ **Barcode Scanning**: Quick product lookup by Product ID
✅ **Multi-Product Cart**: Add multiple products with quantity control
✅ **Payment Calculation**: Automatic change calculation
✅ **Transaction Recording**: All sales saved to database
✅ **Transaction History**: Filter by day, month, or all time
✅ **Revenue Analytics**: View total revenue and transaction statistics
✅ **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Start a Sale**:
   - Enter Member ID on home page
   - If new member, fill registration form
   - You'll be redirected to Purchase Page

2. **Scan Products**:
   - Enter or scan Product ID (barcode)
   - Product automatically added to cart
   - Adjust quantities as needed

3. **Complete Payment**:
   - Click "Checkout"
   - Enter amount paid
   - System shows change amount
   - Confirm payment to save transaction

4. **View Transactions**:
   - Navigate to "Transactions" from menu
   - Select filter (Daily/Monthly/All Time)
   - View transaction details

## Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: LocalStorage for session management

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up MongoDB connection in `.env`:

```
MONGODB_URI=your_mongodb_connection_string
```

3. Run development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── members/
│   │   ├── products/
│   │   └── transactions/
│   ├── components/
│   │   ├── daily/          # Transaction History
│   │   ├── main/           # Member Login
│   │   ├── member/         # Member Management
│   │   ├── product/        # Product Management
│   │   └── navbar/
│   ├── purchase/           # POS Purchase Page
│   └── page.js             # Home Page
├── models/
│   ├── members.js
│   ├── products.js
│   └── transactions.js
└── libs/
    └── mongodb.js
```

## Notes

- Product ID serves as the barcode for scanning
- Member data is stored in localStorage during active session
- All monetary values are displayed with 2 decimal places
- Transactions are timestamped automatically
- Change is calculated and displayed in real-time during payment
