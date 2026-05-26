B"H
# Platform panel Node simulation first slice

The visible repo root is `git/awtsmoos.com`. The platform UI lives at `geelooy/heichelos/heichel/modules/ui/platformPanel.js`, mounted from `geelooy/heichelos/heichel/modules/events.js`, and calls `geelooy/heichelos/heichel/modules/api/platform.js`.

Chrome automation is unavailable in the tunnel device state, so this slice uses Node to simulate the browser enough to verify real module behavior without pretending a full browser exists.

## Small verified path

1. Read the real platform panel and platform API files.
2. Create a tiny DOM harness local to the test, because `jsdom`, `linkedom`, and `happy-dom` are not installed.
3. Import the real browser module through Node ESM.
4. Stub `fetch` to return real-shaped platform payloads.
5. Assert mount idempotency, toggle state, initial DB render, search submit, and feed action wiring.

## Coupling risks noticed

- `platformPanel.js` currently depends on `innerHTML`; the fake DOM must parse only the panel markup contract, not become a giant general DOM.
- API helpers swallow fetch failures by returning null, so the UI must tolerate null responses.
- The panel sets status to ready after each successful action; tests should verify a real rendered surface, not only status text.
