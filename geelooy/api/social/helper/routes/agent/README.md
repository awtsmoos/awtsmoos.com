# B"H — Agent API (geelooy/api/social/helper/routes/agent/)

HTTP API for AI agents acting on Awtsmoos: corpora, glossary, Heichel/post management, search, and a translation pipeline with jobs, batches, and idempotency.

## Files
- `routes.js` — route definitions; `engine.js` — agent engine; `transactions.js` — transactional operations.
- `AGENT_API.md` — agent API documentation; `corpora.json`, `glossary.json` — corpora and glossary data.
- `test/` — `agentApi.test.cjs`.

## Endpoints
- `/agent/health`, `/agent/corpora`, `/agent/glossary`, `/agent/search`
- `/agent/heichelos/create|edit|delete|list`
- `/agent/post`, `/agent/posts/create|edit|delete|list|import`
- `/agent/translate`, `/agent/translate/batch|job|stream|submit`, `/agent/translation-status`
- `/ikar/agentApi/jobs`, `/ikar/agentApi/submissions`, `/ikar/agentApi/idempotency`
