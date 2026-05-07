# Dutse Housing API Documentation

## Authentication

### POST /api/auth/register

Register a new user.

- Body: `{ name, email, password }`
- Returns: `{ token, user }`

### POST /api/auth/login

Login a user.

- Body: `{ email, password }`
- Returns: `{ token, user }`

---

## Properties

### GET /api/properties

List all properties.

- Returns: `Property[]`

### GET /api/properties/:id

Get a single property by ID.

- Returns: `Property`

---

## Checkout

### POST /api/checkout/create-session

Create a Stripe Checkout session for a property purchase.

- Body: `{ propertyId }`
- Auth: Bearer token required
- Returns: `{ url, id }`

---

## Orders

### GET /api/orders/me

Get all orders for the authenticated user.

- Auth: Bearer token required
- Returns: `Order[]`

### GET /api/orders/:id/pdf

Download the PDF certificate for a specific order (must be owner).

- Auth: Bearer token or `?token=` query
- Returns: PDF file

---

## Webhook

### POST /api/webhook

Stripe webhook endpoint for payment confirmation and PDF generation.

- Used by Stripe only. No client use.

---

## Models

### User

- `name`: string
- `email`: string
- `password`: string (hashed)
- `createdAt`: Date

### Property

- `title`: string
- `houseNumber`: string
- `location`: string
- `price`: number
- `description`: string
- `createdAt`: Date

### Order

- `user`: User reference
- `property`: Property reference
- `amount`: number
- `status`: string (pending|paid|failed)
- `stripeSessionId`: string
- `pdfPath`: string
- `createdAt`: Date
