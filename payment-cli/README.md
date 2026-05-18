# webhook-pay-sim

Local Stripe-like webhook simulator for testing webhooks locally.

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Run in development (requires `ts-node-dev`):

```bash
npm run dev -- start --port 3000 --target http://localhost:8080/webhooks
```

3. Build and use the installed CLI:

```bash
npm run build
node dist/index.js start --port 3000 --target http://localhost:8080/webhooks
```
