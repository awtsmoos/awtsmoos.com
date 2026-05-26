B"H
# /ai/ load crash and memory-leak investigation plan

## Observed user symptom
Opening `http://localhost:8080/ai/` takes forever, then crashes. The extension is loaded.

## Grounded starting facts
- Server root: `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`
- Main server entry: `index.js`, listening on port `8080`.
- AI app subtree: `geelooy/ai/`.
- AI test harness exists: `npm run test:ai` -> `node geelooy/ai/tests/harness/run.cjs all`.

## Investigation ladder
1. Trace static route resolution for `/ai/` from the dynamic server.
2. Inspect `geelooy/ai/index.html` and the first browser modules it loads.
3. Search for client memory-risk primitives: intervals, observers, global listeners, recursive render loops, large caches, history loading, stream replay, IndexedDB hydration, background extension bridges.
4. Prefer proving the hang with browser diagnostics against the live local page.
5. Patch only the smallest confirmed leak or runaway bootstrap path.
6. Verify with syntax checks and, if available, live page load/console/memory behavior.

## Early risk hypotheses
- Extension bridge reconnect or background stream mirror creates repeated listeners or message ports.
- Conversation/history boot loads too much data before first paint.
- Render runtime hydrates massive raw JSON/thought/event payloads into DOM repeatedly.
- A scroll/loading sweep or observer loop repeatedly scans the full page.
- Stream resume store replays an unbounded backlog on initial load.
