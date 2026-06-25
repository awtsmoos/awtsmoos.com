B"H

# Full remote desktop implementation pass

Goal: convert the brainstorm into a concrete, testable tunnel action surface without pretending to silently control a user's OS.

Files to write fully:
- `agent/tools/fs/actions.js`: register the new action group.
- `agent/tools/fs/actionGroups/remoteDesktopActions.js`: public FS tool actions.
- `agent/tools/fs/remoteDesktop/policy.js`: safety gates and permission language.
- `agent/tools/fs/remoteDesktop/store.js`: in-memory session lifecycle and audit ledger.
- `agent/tools/fs/remoteDesktop/signaling.js`: WebRTC-style offer/answer/ICE/event helpers.
- `agent/testing/remoteDesktopActions.test.cjs`: verify session, consent, signaling, input gates, revoke.
- `agent/docs/REMOTE_DESKTOP_TUNNEL.md`: durable handoff / architecture doc.
- Update `agent/manifest.txt` via existing manifest builder.

Definition of done:
- Actions appear in `buildActions`.
- Control/input is rejected until explicit grant.
- Watch-only can be granted independently.
- Signaling and audit are testable.
- Manifest includes new shipping files.

