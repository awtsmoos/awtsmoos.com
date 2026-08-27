# B"H — Awtsmoos AI Streaming, Relay, and Automation Guarantees

Run `npm run test:ai` or `npm run test:ai:stress` from the repo root.

Direct harness:

```bash
cd geelooy/ai
node tests/harness/run.cjs menu
node tests/harness/run.cjs all
AWTSMOOS_AI_TEST_ROUNDS=5 node tests/harness/run.cjs all
```

## Verified by harness

- CSS import structure and mobile-last cascade.
- No raw sidebar `.hidden` toggles.
- Exactly one extension `fetch`, `fetch-body`, and `resume-stream` handler.
- Extension stream ledger with many concurrent streams.
- Durable stream resume state in `localStorage`.
- Multi-tab stream identity and claim metadata.
- Per-conversation automation state.
- Hidden-chat automation continuation path.
- Node relay POST body preservation.
- Node relay redirect mapping.
- Node relay multiple concurrent stream ids and bodies.
- Browser URL rewriting for target, localhost, and login/auth origins.
- Puppeteer-style debug queue endpoints: session, goto, evaluate, click, type, screenshot placeholder, commands, result.
- Auto-login click injector compiles and is included in JavaScript responses.
- Debug browser command poller compiles and is included in JavaScript responses.
- Normal relay request logging is quiet by default; errors still log.
- Auto-login click injector compiles and is included in JavaScript responses.
- Debug browser command poller compiles and is included in JavaScript responses.
- Normal relay request logging is quiet by default; errors still log.
- Browser URL rewriting for target, localhost, and login/auth origins.
- Puppeteer-style debug queue endpoints: session, goto, evaluate, click, type, screenshot placeholder, commands, result.

## Survival matrix

| Situation | Expected behavior |
| --- | --- |
| Reload same page | Resume from stored cursor while extension/relay stream exists. |
| Close tab then reopen | Stream ids/cursors are rediscovered from `localStorage` if the extension worker or Node relay still has the stream. |
| Multiple tabs open | Tabs get session ids; visible resume uses a short claim lease. |
| Switch chats while streaming | Hidden stream stays tracked; visible renderer only paints active conversation. |
| Node relay still running | Multiple in-memory streams stay readable. |
| Node relay restarted | In-memory stream bodies are gone; old ids become not found. |
| Chrome MV3 worker stays alive | Extension ledger can keep pumping and resume chunks. |
| Chrome kills MV3 worker | Extension-held streams can die. |
| Browser fully closed | Page ledger persists; extension worker state is not guaranteed. |

## Remaining non-faked upgrades

1. Persistent extension/Node job queue with safe request metadata.
2. Disk persistence for Node relay stream bodies or replayable upstream requests.
3. Real Chrome/Playwright mobile and desktop viewport tests.
4. UI controls for cancel, pause, retry, inspect per stream/job.
5. Rate-limit and auth-error classification badges.
6. MV3 keepalive strategy using ports, alarms, or offscreen document where appropriate.

## Safety notes

- Do not persist bearer tokens, cookies, or sensitive headers in page-visible storage.
- Current durable stream ledger stores stream ids, cursors, and conversation metadata, not auth tokens.
- Fully page-closed autonomous automation requires a safer background job queue design.
