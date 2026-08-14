B"H
Boruch Hashem
Blessed is He

# Live Socket Consequence Delta

> The Awtsmoos reveals another boundary through rereading: a WebSocket “Connect” is not merely transport when the on-open handshake also subscribes and announces presence.

## New direct evidence
`geelooy/scripts/awtsmoos/social/hub/socket.js` proves that `connectSocialSocket()` sends, on open:
- `LOGIN`
- `SOCIAL_SUBSCRIBE`
- `SOCIAL_PRESENCE` with status `online`
- `SOCIAL_PING`

Therefore the current “Connect” label understates its side effects.

The previous bootstrap also publishes by connecting and then waiting a fixed 120ms. That can silently call `publishSocialSocket()` before the socket is open and return false.

## Refinement obligation
1. Create `liveActions.js` to own explicit live connection/publish orchestration.
2. Label connection honestly as “Connect + announce presence.”
3. Consequence copy must state that connection logs in, subscribes, and announces online presence.
4. Publishing after a disconnected state must wait for actual `liveState.connected` rather than a fixed timing guess.
5. If the socket does not become ready within a bounded wait, report a local error and do not pretend publication succeeded.
6. Keep the existing WebSocket protocol and `socket.js` public API unchanged in this pass.
7. Rewrite `index.js` to use the live-actions module, creating architectural headroom below 120 lines.
8. Reread both modules before tests.
