# Dutse Housing (MERN)

This repository scaffolds a minimal MERN application for browsing properties,
registering users, checking out via Stripe Checkout, and generating a PDF
certificate upon purchase.

Quick start (server):

1. Ensure local MongoDB is running.
2. Copy `.env.example` to `server/.env` and fill values.
3. Install and run server:

```bash
cd server
npm install
npm run dev
```

Quick start (client):

Create or scaffold the React client in `client/` (this repo includes a minimal
client). From `client`:

```bash
cd client
npm install
npm start
```

Stripe webhook testing:

Use the Stripe CLI to forward webhooks to the server:

```bash
stripe listen --forward-to localhost:5000/api/webhook
```

Files of interest:

- `server/` - Express API, Mongoose models, PDF generation helper
- `client/` - React frontend pages
