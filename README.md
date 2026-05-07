# Dutse Housing (MERN)

![Workflow](docs/workflow.png)

> **Note:** This project is for development and demonstration purposes only. It
> is not production-ready. Do not use as-is for real transactions or sensitive
> data.

Dutse Housing is a minimal MERN stack application for property browsing, user
registration, Stripe Checkout, and automatic PDF certificate generation after
purchase. It is designed for local development and learning.

## Quick Start

### Server

1. Ensure local MongoDB is running.
2. Copy `.env.example` to `server/.env` and fill in your values.
3. Install dependencies and run the server:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. (Optional) Seed the database with sample properties:
   ```bash
   node seed.js
   ```

### Client

1. From the `client` directory:
   ```bash
   cd client
   npm install
   npm start
   ```

### Stripe Webhook Testing

To test Stripe webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/api/webhook
```

## API Reference

See [API.md](API.md) for full endpoint documentation.

## Project Structure

- `server/` - Express API, Mongoose models, PDF generation helper
- `client/` - React frontend pages

## Development Only

- No production security hardening
- No production Stripe or MongoDB configuration
- No rate limiting, CORS restrictions, or advanced error handling

**For demonstration and local development only.**
