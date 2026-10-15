# B"H — Contact API (`/api/contact/`)

Public contact-signal intake: issue reports, ideas, account questions.
Validates input, rate-gates per client, delivers via mail transport.

## Subdirectories

- `services/` — Validation, delivery, and rate-gate policy modules.

## Files

- `_awtsmoos.derech.js` — Route registration.
- `DOCUMENTATION.md` — Full payload spec and route table.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/contact/` | Health and discovery. |
| `GET` | `/api/contact/status` | Explicit health endpoint. |
| `POST` | `/api/contact/` | Validate and deliver one contact signal. |

## POST payload

Required: `name` (≤80), `email` (email-shaped, ≤160), `subject` (≤140),
`message` (≥12 chars, ≤5000). `kind` is one of `issue`, `idea`, `account`,
`other`. `company` is a honeypot (must stay empty); `startedAt` guards
against instant bot submissions.
