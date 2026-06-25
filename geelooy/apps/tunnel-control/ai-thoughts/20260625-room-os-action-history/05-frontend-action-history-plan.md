B"H

# Frontend Action History Plan

Observed current state:

- `store.js` rebuilds events from collaboration room messages and mission timeline only.
- `missionRoomStream.js` now emits `actionHistory` and `roomOs`, but frontend ignores both.
- `activity.js`, `review.js`, `inspector.js`, and `replay.js` already consume `state.events`, so canonical event normalization is the highest-leverage frontend slice.

Plan:

1. Rewrite `events.js` to normalize action ledger entries into room events.
2. Rewrite `store.js` to retain `state.actionHistory` and `state.roomOs`.
3. Make metrics prefer `roomOs.metrics` when present.
4. Rewrite `activity.js` helpers to understand payload.input, output refs, action IDs, and groups.
5. Rewrite `inspector.js` to generate replay payloads and snippets from action ledger inputs.
6. Verify syntax.

Reasoning:

The UI already has several panes. Instead of adding new disconnected panes first, let the existing activity, inspector, replay, review, files, and metrics panes drink from the real action ledger.
