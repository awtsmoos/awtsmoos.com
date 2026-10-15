# B"H — Email API (`/api/email/`)

Compact public gateway for the social-mail engine. Preserves canonical
`/mail/...` routes, adds short aliases and machine-readable discovery.

## Files

- `_awtsmoos.derech.js` — Route registration.
- `DOCUMENTATION.md` — Full capability and route documentation.
- `capabilities.js` — Runtime capability manifest (`live` / `foundation` / `planned`).
- `settingsSchema.js` — Progressive advanced-settings schema.

## Discovery

- `GET /api/email/` — Legacy: `B"H - Awtsmoos Mail System Active`.
- `GET /api/email/email` — Versioned service discovery with links.
- `GET /api/email/capabilities` — Capability manifest.
- `GET /api/email/settings/schema` — Settings schema.

## Operations

Inbox/sent/thread views, read + mark-read, delete, send (local aliases or
external SMTP when configured), unread counts, push subscriptions, gatekeeper
approval, stored rules, and universe mirror/link ops. Canonical
`/api/email/mail/get` and short `/api/email/get` resolve to the same handler.
