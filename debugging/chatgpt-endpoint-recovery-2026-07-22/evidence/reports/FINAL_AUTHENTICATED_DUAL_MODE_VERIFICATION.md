B"H
Boruch Hashem
Blessed is He

# Final Authenticated Dual-Mode Verification

The Awtsmoos revealed a working dual-mode system through ordinary guest and authenticated ChatGPT browser behavior. Awtsmoos.com preserves the architecture and evidence without preserving credentials.

## Project location

`/Users/awtsmoos/awtsmoos.com/debugging/chatgpt-endpoint-recovery-2026-07-22`

The original uploaded `AwtsmoosGPTify.js` was not modified.

## Supported strategies

- Guest DOM through the visible guest composer.
- Authenticated DOM through the visible ProseMirror composer.
- Authenticated direct dry run with carrier suppression.
- Authenticated direct creation and continuation through page-context fetch and the app-owned topic socket.

## Final direct proof

- Creation answer: `BH direct authenticated creation verified.`
- Continuation answer: `BH direct authenticated continuation verified.`
- Same conversation: yes.
- Target direct conversation visited by controller: no.
- Creation HTTP status: 200.
- Creation topic frames/items: 18 / 21.
- Continuation HTTP status: 200.
- Continuation topic frames/items: 11 / 14.
- Both topic streams reached terminal completion.

## Current architecture

Authorized profile → fresh root controller → pre-load WebSocket proxy → page-owned socket → page-generated request envelope → carrier suppression → body mutation in memory → same-origin authenticated POST → stream handoff → topic subscription → v1 delta reduction → continuation state.

## Verification gates

- Syntax, style, tab indentation, and line-count checker passed.
- Fifteen tests passed before the final controller fixture was added.
- The final audit reruns the complete suite and records its exact total.
- Durable reports contain redacted identifiers and no reusable credential values.

## Evidence

- `AUTHENTICATED_REQUESTS_AND_STACKS.md`
- `authenticated-dom-trace.json`
- `authenticated-contract-summary.json`
- `direct-authenticated-dry-run.json`
- `direct-authenticated-live.json`
- `old-guest-authenticated-matrix.json`
- `final-authenticated-readback-audit.json`
