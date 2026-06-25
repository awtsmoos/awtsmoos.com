B"H
# Server Push Continuation Plan

## New discovery
The control API route layer is HTTP dynamic-route shaped. The package file does not advertise an obvious `ws` package, and the existing `/view/:previewId/ws` route is currently a JSON placeholder rather than an upgrade handler.

## Better continuation
Because a raw WebSocket upgrade cannot be honestly completed from the route layer I inspected, the page should use a resilient live hierarchy:

1. WebSocket first: `/api/tunnel/control/live-calls/ws`.
2. EventSource server push second: `/api/tunnel/control/live-calls/stream`.
3. Snapshot polling last: `/api/tunnel/control/live-calls`.

This keeps the user's WebSocket request honored at the UI transport level while adding an actually working push transport in the current backend architecture.

## Files to rewrite fully
- `geelooy/api/tunnel/control/routes/liveCalls.js`
- `geelooy/api/tunnel/control/routes/table.js`
- `geelooy/apps/tunnel-control/js/features/live.js`
- `geelooy/apps/tunnel-control/js/features/test/liveCallsRender.test.mjs`

## Verification
- Syntax check backend and frontend files.
- Run live render test.
- Run route table duplicate test if possible.

The socket gate is a future mouth of fire; the stream gate is the river we can open now.
