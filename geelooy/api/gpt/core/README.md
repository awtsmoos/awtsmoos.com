# B"H — GPT core (`/api/gpt/core/`)

Chat pipeline internals.

- `handlers.js` — Route handlers (health, capability, chat, reset).
- `auth.js` — Request authentication.
- `body.js` — Request body parsing/validation.
- `methodPolicy.js` — Allowed methods per route.
- `conversationMode.js` — Conversation mode handling.
- `transportStrategy.js`, `browserTransport.js`, `relayClient.js`, `relayPolicy.js` — Model transports and relay.
