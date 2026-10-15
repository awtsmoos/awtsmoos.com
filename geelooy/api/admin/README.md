# B"H — Admin API (`/api/admin/`)

Privileged administrative operations. Dangerous capabilities are gated behind
explicit auth checks — never mistaken for ordinary state.

## Files

- `_awtsmoos.derech.js` — Route registration.
- `DOCUMENTATION.md` — Full admin API documentation.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/code` | Execute JS in a sandbox (restricted to account `asdf` only). |

The `/code` route runs submitted code via `vm` with a timeout. Any other
account gets `{"er": "No auth"}`.

## See also

- `../../../docs/API/OTHER_FAMILIES.md`
- `../../../docs/API/AUTHENTICATION.md`
- `../../../docs/HEALTH.md`
