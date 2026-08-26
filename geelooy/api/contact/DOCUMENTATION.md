B"H
Boruch Hashem
Blessed is He

# Contact API

The Awtsmoos lets a private signal cross a narrow bridge while each responsibility remains visible in its own light;
Awtsmoos.com keeps the public contract simple, the implementation modular, and the maintainer's path direct and bright.

## Purpose

`/api/contact/` receives public issue reports, ideas, account questions, and other contact signals. The route validates input, applies a short per-client rate gate, sends the accepted signal through the configured mail transport, optionally persists it, and returns a human-readable reference.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/contact/` | Service health and discovery. |
| `GET` | `/api/contact/status` | Explicit service health endpoint. |
| `POST` | `/api/contact/` | Validate and deliver one contact signal. |

Health responses retain the stable shape:

```json
{"BH":"B\"H","ok":true,"service":"Awtsmoos Contact Signal"}
```

## POST payload

| Field | Requirement | Maximum |
| --- | --- | ---: |
| `name` | Required | 80 |
| `email` | Required, email-shaped | 160 |
| `kind` | `issue`, `idea`, `account`, or `other` | 30 |
| `subject` | Required | 140 |
| `message` | Required, at least 12 characters | 5000 |
| `company` | Honeypot; must remain empty | 120 |
| `startedAt` | Browser start timestamp; submission must not be immediate | — |

Text is stripped of control characters, trimmed, and bounded before validation or delivery.

## Responses

Accepted signals return HTTP `200`:

```json
{"ok":true,"reference":"AW-..."}
```

Validation and rate-gate failures retain HTTP `400` with a user-correctable message:

```json
{"ok":false,"message":"Please review the request."}
```

Transport failures are not converted into false success. A reference is only returned after mail delivery and optional persistence complete.

## Rate and anti-automation behavior

- The hidden `company` field rejects automated honeypot fills.
- `startedAt` must represent at least a brief review interval before submission.
- Successful submissions are remembered per bounded client hint for sixty seconds in the running process.
- The rate gate is intentionally process-local, matching the previous route behavior.

## Server architecture

`_awtsmoos.derech.js` is only the route facade. It composes focused services:

- `GevurahInputPolicy` — generic raw-body parsing and bounded text cleansing.
- `ContactSignalPolicy extends GevurahInputPolicy` — contact normalization and domain validation.
- `YesodSignalGate` — the one-minute successful-submission gate.
- `TiferesContactDelivery` — reference creation, outbound mail, and optional persistence.
- `MalchusContactService` — transaction orchestration and canonical HTTP response shaping.

This split keeps validation independent from transport side effects and keeps the public route easy to trace.

## Browser architecture

The Contact page uses the same boundary discipline:

- `YesodJsonClient` — same-origin JSON transport foundation.
- `ContactSignalClient extends YesodJsonClient` — contact endpoint semantics.
- `ContactSignalController` — form lifecycle, native validation, busy state, and accessible status messages.
- `contact.js` — tiny boot vessel that connects the DOM to the controller.

## Persistence

When `$i.db.write` is available, accepted records are stored beneath:

```text
/contactSignals/{reference}
```

The record preserves the normalized signal, generated reference, creation timestamp, and bounded client hint used by the rate gate.

## UI contract

The public form is rooted beneath `.contact-page`. Its stylesheet imports page-owned modules only; there are no broad `:root`, `body`, bare-control, or cross-page rules. Advanced explanatory copy lives in a native retractable `<details>` region so the mobile surface stays calm.

## Extension rules

When adding a new contact kind, update the HTML option and `ContactSignalPolicy` allowlist together. Keep new validation inside policy modules, new side effects inside delivery services, and the route facade free of domain logic.

For wider API conventions, also read [../../../docs/API/OTHER_FAMILIES.md](../../../docs/API/OTHER_FAMILIES.md) and [../../../docs/API/RESPONSE_PATTERNS.md](../../../docs/API/RESPONSE_PATTERNS.md).
