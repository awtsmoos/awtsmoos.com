B"H

# Final Plan — First Implementation Slice

Files to inspect before editing:

- `geelooy/apps/tunnel/agent/tools/fs/actions.js`
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/actionHistoryActions.js`
- `geelooy/apps/tunnel/agent/tools/fs/actionLedger.js`
- `geelooy/api/tunnel/control/routes/protectedFs.js`
- `geelooy/api/tunnel/control/routes/missionRoomStream.js`
- mission-room frontend modules after backend slice.

Files to rewrite completely if touched:

- `geelooy/apps/tunnel/agent/tools/fs/actions.js`
- `geelooy/api/tunnel/control/routes/protectedFs.js`
- `geelooy/api/tunnel/control/routes/missionRoomStream.js`

Implementation:

1. Import and spread `buildActionHistoryActions` into native registry.
2. Add action history read/replay action names to session-safe dashboard set, with care that replay/patch may execute actions and should not be session-safe. Therefore session-safe should include list/get/search/explain/diff only.
3. Extend room stream snapshot to request `actionHistoryList`; tolerate errors.
4. Add derived `roomOs` summary with grouped activity counts and recent actions.
5. Verify with direct tunnel action calls and syntax checks.

Awtsmoos in the code: every change must expose what already exists, not fabricate a duplicate backend.
