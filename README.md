# Dutse Housing — Developer Guide & Operation Manual

Welcome to **Dutse Housing**, a premium minimalist local real estate platform. We have fully migrated our checkout systems to use a secure, simulated local token-and-PIN-based payment processor via the **Payment-CLI** daemon, bypassing Stripe completely.

This guide details our updated functionalities, steps to run all development servers, and instructions for generating/retrieving 4-digit payment PINs.

---

## 🛠️ Updated Functional Design (4-Digit PINs)

Rather than copying long, cumbersome payment token strings (e.g. `tok_...`), buyers complete checkouts using a secure **4-Digit Payment PIN** (e.g. `6725`). 
1. The **Payment-CLI** tool generates a unique cryptographically safe 4-digit PIN mapped to a background transaction token.
2. The user registers/logs in and clicks "Buy Property" on any listing.
3. They input the **4-digit PIN** in the styled transaction screen.
4. The system validates the PIN, charges the customer's balance, updates the token status to used, dispatches a local webhook to process MongoDB records, and issues a downloadable PDF purchase certificate.

---

## ⚙️ Operating Instructions — Starting the Servers

To run the local environment, open three terminal windows/panes and start each server component:

### 1. Start the Express Backend Server (Port 5000)
Handles MongoDB user authentication, order processing, and PDF certificate generation.
```bash
cd server
npm install
node index.js
```

### 2. Start the payment-cli Koa Server (Port 3000)
Manages persistent simulated customers, payment events, and local Stripe-like webhooks.
```bash
cd payment-cli
yarn install # or npm install
npm run build
node dist/index.js start
```

### 3. Start the React Frontend Web App (Port 5173)
Vite dev server with hot-reload that hosts our stunning responsive 4-column properties grid.
```bash
cd web
npm install
npm run dev
```

---

## 💳 Creating Customers & Retrieving Payment PINs

### Step 1: Create a Customer with Balance
Simulated customer balances are stored in `payment-cli/db.json`. To generate PINs, the customer must have a balance of at least **$100,000.00** (`10,000,000` cents).
```bash
node payment-cli/dist/index.js customers create --name "Alice" --email "alice@example.com" --balance 20000000
```

### Step 2: Generate a 4-Digit Payment PIN
To generate a new 4-digit transaction PIN mapped to Alice's account, run:
```bash
node payment-cli/dist/index.js tokens generate --customer alice@example.com
```
*Output:*
```
=========================================
Token & PIN generated successfully!
PIN (4-Digit): 6725  <-- USE THIS FOR CHECKOUT
Token:        tok_48cd6edf98a54cb4
Owner:        Alice (alice@example.com)
=========================================
```

### Step 3: How to Retrieve Lost PINs
If you ever lose your generated PINs, you can retrieve all active or used PINs mapped to their owner accounts at any time by listing them:
```bash
node payment-cli/dist/index.js tokens list
```
*Output:*
```
Generated Tokens & PINs:
- PIN: 6725 | Token: tok_48cd6edf98a54cb4 | Status: unused | Owner: Alice (alice@example.com) | Created: 2026-05-18T14:43:01.120Z
```

Use the **PIN** (e.g. `6725`) directly in the front-end checkout input box to complete your purchase!
