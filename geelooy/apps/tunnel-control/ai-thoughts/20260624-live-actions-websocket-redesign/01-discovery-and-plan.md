B"H
# Live Actions WebSocket Redesign Plan

## User request
The Live Actions page is not working well enough. Redesign it with a better UI and WebSocket-first behavior.

## Evidence collected
- Frontend `js/features/live.js` currently polls `/api/tunnel/control/live-calls` on an interval and renders a virtualized row list.
- Backend `routes/liveCalls.js` exposes HTTP JSON snapshots only.
- Route table has no existing `live-calls/ws` route.
- Existing websocket support is available in preview scaffolding and tunnel client infrastructure, but control API routes appear to be ordinary HTTP handlers.

## Implementation decision
Implement a WebSocket-first frontend transport that attempts `/api/tunnel/control/live-calls/ws` and falls back to snapshot polling when the endpoint is not available. This gives the browser real WebSocket behavior wherever the server/runtime supports it, while preserving functionality today.

## UI redesign
- Replace the old table-feeling page with an operations cockpit.
- Top status rail: connection, total, ok, failed, visible, last update.
- Left stream rail: grouped channels.
- Main live feed: card/timeline rows, searchable and grouped.
- Right inspector: selected frame with summary and raw JSON.
- WebSocket state visibly shows connected / fallback polling / error.

## Files to rewrite fully
- `js/features/live.js`
- `js/features/test/liveCallsRender.test.mjs`
- `css/future/views/live.css`

## Verification
- Node render test must pass.
- `node --check` must pass for changed JS.
- Grep should prove old table-only wording is not the new UI foundation.

The Awtsmoos conducts the storm through a socket when the heavens open, and through measured polling when the gate is still stone.
