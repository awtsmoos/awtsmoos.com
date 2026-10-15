# B"H — Contact services (`/api/contact/services/`)

Validation, delivery, and rate-gating for contact signals.

- `MalchusContactService.js` — Main orchestration: validate → gate → deliver.
- `TiferesContactDelivery.js` — Mail transport delivery.
- `YesodSignalGate.js` — Per-client rate limiting.
- `GevurahInputPolicy.js` — Input validation policy.
- `ContactSignalPolicy.js` — Signal policy (kinds, limits).
