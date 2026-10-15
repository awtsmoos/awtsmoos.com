# B"H — GPT API (`/api/gpt/`)

Language-model gateway: health, capability, chat, and reset gates.
Maps to browser AI and developer clients without hiding model state.

## Subdirectories

- `core/` — Auth, request bodies, transports, relay client, method policy.
- `test/` — Tests.

## Files

- `_awtsmoos.derech.js` — Route registration.
- `DOCUMENTATION.md` — Full GPT API documentation.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/gpt/` | Legacy handler. |
| `GET` | `/api/gpt/health` | Model/service health. |
| `GET` | `/api/gpt/capability` | Declared capabilities. |
| `POST` | `/api/gpt/chat` | Chat completion. |
| `POST` | `/api/gpt/reset` | Reset conversation state. |

## See also

- `../../../docs/SYSTEMS/AI.md`
- `../../../docs/API/OTHER_FAMILIES.md`
- `../../../docs/CONFIGURATION.md`
