# 🏠 Dutse Housing — User Guide & Operations Manual

![Dutse Housing Workflow](./Dutse_Housing.jpeg)

Welcome to **Dutse Housing**, a premium, high-end minimalist real estate portal.
Our platform allows users to browse local premium property listings in Dutse and
complete purchases safely using a secure, simulated local token-and-PIN payment
daemon, completely bypassing third-party payment processors like Stripe.

---

## 💡 Non-Developer Quick Start: How Does It Work?

If you are a non-developer, think of this application as having three simple
parts that work together to create a realistic property marketplace:

1. **The Web Portal (Vite)**: The beautiful visual website where users browse
   property cards, view architectural details, and buy listings.
2. **The Backend Manager (Express & MongoDB)**: The core brain that keeps track
   of active users, saved listings, and issues official purchase certificates.
3. **The Local Bank Simulator (Payment-CLI)**: A local digital vault (ledger)
   that securely stores simulated balances and generates 4-digit checkout PINs.

Rather than copying long, complicated payment codes, you complete checkouts on
the website using a simple **4-digit PIN** (just like at an ATM!).

---

## ⚙️ How to Start the Application (Step-by-Step)

To run the platform, you need to start the 3 components. Open **three separate
terminal windows** on your computer and run one command in each:

### Terminal 1: Start the Backend Manager

This component handles user accounts, property listings, and certificate
downloads.

```bash
cd server
npm install
node index.js
```

_You will see:_ `Server running on port 5000` and `MongoDB connected`

### Terminal 2: Start the Bank Simulator (payment-cli)

This component is a local ledger that the admin uses to synchronize customer
balances. The CLI now uses MongoDB as its backing store — you must provide
`MONGO_URI` in the environment or in `payment-cli/.env`.

```bash
cd payment-cli
npm install
npm run build
MONGO_URI="mongodb://localhost:27017/dutse_housing" node dist/index.js start
```

_You will see:_ `webhook-pay-sim listening on http://localhost:3000` or similar

### Terminal 3: Start the Web Portal

This component hosts the actual website interface.

```bash
cd web
npm install
npm run dev
```

_You will see:_ `Vite server running at http://localhost:5173/`

Now, open your web browser and go to
**[http://localhost:5173](http://localhost:5173)** to explore the platform!

---

## 💳 Step-by-Step Checkout & PIN Instructions

To buy a property, follow these simple steps to allocate simulated money and
retrieve a checkout PIN:

### Step 1: Sign in as Administrator & Top-Up Balances

You do not need to run commands to get money!

1. Go to the website
   **[http://localhost:5173/login](http://localhost:5173/login)**.
2. Log in using the default Admin account:
   - **Email**: `admin@example.com`
   - **Password**: `adminpassword`
3. Click the **Admin Panel** link in the navigation bar.
4. Select the **Credit User Balance** tab.
5. Enter the email address of the customer (e.g. `david@example.com`) and credit
   them with funds (e.g., `250000` for $250,000.00). Click **Top-up Customer
   Balance**.

### Step 2: Request a Deposit (Customer)

Customers create a deposit request (amount in dollars) from the Dashboard and
confirm with their 4-digit PIN. The request stays in `pending` until an admin
approves it.

Alternatively the `payment-cli` can create customers and simulate webhooks; the
CLI now requires `MONGO_URI` and no longer uses file-based `db.json` or
token-based flows.

### Step 3: Complete the Purchase

1. Log out of the admin account and sign in as the customer
   (`david@example.com`).
2. Select any property card on the homepage (e.g. **Stunning Beachfront Manor**)
   and click **View Details**.
3. In the checkout box, enter the **4-digit PIN** generated in Step 2 (e.g.
   `7347`) and click **Buy Property**.
4. You will be redirected to a **Success Screen**, and your new real estate
   asset will show up in your **Dashboard** with a green **Paid** badge and a
   downloadable PDF purchase certificate!

### Notes

- PINs are set by the user once (4 digits) and stored hashed. Admins approve
  deposit requests which credit the user's `balance` (stored in cents).
- The old token-based workflow has been replaced by deposit requests and admin
  approval. The CLI now requires a MongoDB connection (`MONGO_URI`) and operates
  against the same database.
