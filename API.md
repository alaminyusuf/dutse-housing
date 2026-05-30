# 🏠 Dutse Housing — API Documentation

This document covers all available backend endpoints, authorization rules, request payloads, and data schemas for the **Dutse Housing** real estate portal. All backend logic operates natively against the MongoDB database without any external Stripe or third-party payment system connections.

---

## 🔐 Authentication

### POST `/api/auth/register`
Register a new customer.
- **Request Body**:
  ```json
  {
    "name": "David",
    "email": "david@example.com",
    "password": "password123"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "token": "JWT_BEARER_TOKEN",
    "user": {
      "id": "USER_OBJECT_ID",
      "name": "David",
      "email": "david@example.com",
      "role": "user"
    }
  }
  ```

### POST `/api/auth/login`
Authenticate an existing customer or administrator.
- **Request Body**:
  ```json
  {
    "email": "david@example.com",
    "password": "password123"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "token": "JWT_BEARER_TOKEN",
    "user": {
      "id": "USER_OBJECT_ID",
      "name": "David",
      "email": "david@example.com",
      "role": "user"
    }
  }
  ```

### POST `/api/auth/pin`
Configure or update the user's secure 4-digit payment PIN.
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
  ```json
  {
    "pin": "1234"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "message": "Payment PIN set successfully"
  }
  ```

---

## 🏢 Properties

### GET `/api/properties`
Fetch all active, unsold real estate listings.
- **Returns**: `200 OK`
  ```json
  [
    {
      "_id": "PROP_OBJECT_ID",
      "title": "Stunning Beachfront Manor",
      "houseNumber": "Apt 4B",
      "location": "Dutse Beachfront",
      "price": 180000,
      "coverImage": "/storage/cover_images/beachfront.jpg",
      "sold": false,
      "description": "Premium 4-bedroom beachfront villa with exquisite sunset views."
    }
  ]
  ```

### GET `/api/properties/:id`
Fetch details for a specific property listing.
- **Returns**: `200 OK`
  ```json
  {
    "_id": "PROP_OBJECT_ID",
    "title": "Stunning Beachfront Manor",
    "houseNumber": "Apt 4B",
    "location": "Dutse Beachfront",
    "price": 180000,
    "coverImage": "/storage/cover_images/beachfront.jpg",
    "sold": false,
    "description": "Premium 4-bedroom beachfront villa with exquisite sunset views."
  }
  ```

### POST `/api/properties`
Upload and list a new premium property with a cover image.
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `title`: string (required)
  - `houseNumber`: string (required)
  - `location`: string (required)
  - `price`: number (required)
  - `description`: string (optional)
  - `coverImage`: binary file (optional)
- **Returns**: `201 Created`
  ```json
  {
    "_id": "PROP_OBJECT_ID",
    "title": "Stunning Beachfront Manor",
    "price": 180000,
    "sold": false
  }
  ```

---

## 📥 Deposits & Ledger Management

### POST `/api/deposit/generate`
Create a pending deposit request in the local simulated ledger.
- **Headers**: `Authorization: Bearer <USER_TOKEN>`
- **Request Body**:
  ```json
  {
    "amount": 250000,
    "pin": "1234"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "message": "Deposit request created and pending approval"
  }
  ```

### GET `/api/admin/deposits`
Fetch all pending and historical deposit requests.
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Returns**: `200 OK`
  ```json
  [
    {
      "_id": "DEPOSIT_OBJECT_ID",
      "user": {
        "_id": "USER_OBJECT_ID",
        "name": "David",
        "email": "david@example.com"
      },
      "amountCents": 25000000,
      "status": "pending",
      "createdAt": "2026-05-30T12:00:00.000Z"
    }
  ]
  ```

### POST `/api/admin/deposits/:id/approve`
Approve a pending deposit request, instantly crediting the customer's balance.
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Returns**: `200 OK`
  ```json
  {
    "deposit": {
      "_id": "DEPOSIT_OBJECT_ID",
      "status": "approved",
      "approvedAt": "2026-05-30T12:05:00.000Z"
    },
    "newBalanceCents": 25000000
  }
  ```

### POST `/api/admin/generate-balance`
Directly credit balance for a user's account in the database (administrative utility).
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Request Body**:
  ```json
  {
    "email": "david@example.com",
    "amount": 150000
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "message": "Balance credited successfully",
    "currentBalanceCents": 15000000,
    "customer": {
      "id": "USER_OBJECT_ID",
      "name": "David",
      "email": "david@example.com",
      "balance": 15000000
    }
  }
  ```

---

## 💳 Payments & Orders

### POST `/api/payments/charge`
Purchase a property by debiting the user's credited balance after verifying their payment PIN.
- **Headers**: `Authorization: Bearer <USER_TOKEN>`
- **Request Body**:
  ```json
  {
    "propertyId": "PROP_OBJECT_ID",
    "pin": "1234"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "message": "Charge successful",
    "orderId": "ORDER_OBJECT_ID"
  }
  ```

### GET `/api/orders/me`
Retrieve all property purchases and associated PDF certificates for the signed-in customer.
- **Headers**: `Authorization: Bearer <USER_TOKEN>`
- **Returns**: `200 OK`
  ```json
  [
    {
      "_id": "ORDER_OBJECT_ID",
      "property": {
        "_id": "PROP_OBJECT_ID",
        "title": "Stunning Beachfront Manor"
      },
      "amount": 180000,
      "status": "paid",
      "pdfPath": "/storage/pdfs/certificate_ORDER_OBJECT_ID.pdf",
      "createdAt": "2026-05-30T12:10:00.000Z"
    }
  ]
  ```

### GET `/api/orders/:id/pdf`
Download the horizontal elegant PDF Ownership Certificate for a completed transaction.
- **Headers**: `Authorization: Bearer <USER_TOKEN>` (or `?token=JWT_TOKEN` in URL parameter)
- **Returns**: Binary PDF Stream (`application/pdf`)

---

## 🗄️ Database Models Reference

### User
- `name` (String, required): Full name
- `email` (String, required, unique): Account email address
- `password` (String, required): Bcrypt hashed password
- `role` (String, enum: `["user", "admin"]`, default: `"user"`): System permissions
- `pinHash` (String): Hashed 4-digit numeric checkout authorization PIN
- `pinSet` (Boolean, default: `false`): Track if PIN has been set
- `balance` (Number, default: `0`): Customer's account balance stored in cents
- `createdAt` (Date): Registration date

### Property
- `title` (String, required): Listing title
- `houseNumber` (String, required): Structural identifier
- `location` (String, required): Geographic city/neighborhood
- `price` (Number, required): Numeric price in US Dollars
- `description` (String): Freeform details
- `coverImage` (String): Server location of the uploaded cover image resource
- `sold` (Boolean, default: `false`): Buyable lock status
- `createdAt` (Date): Upload date

### Order
- `user` (ObjectId, ref: `User`, required): The purchasing customer
- `property` (ObjectId, ref: `Property`, required): The acquired real estate asset
- `amount` (Number, required): Absolute cost in dollars
- `status` (String, enum: `["pending", "paid", "failed"]`, default: `"pending"`): Purchase state
- `pdfPath` (String): File system location of the horizontal print certificate
- `createdAt` (Date): Completion date

### DepositRequest
- `user` (ObjectId, ref: `User`, required): Requesting customer
- `amountCents` (Number, required): Value requested in cents
- `status` (String, enum: `["pending", "approved", "rejected"]`, default: `"pending"`): Deposit state
- `createdAt` (Date): Request date
- `approvedAt` (Date): Date of balance credit
- `approvedBy` (ObjectId, ref: `User`): Approving Administrator
