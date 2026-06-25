B"H

# Better remote desktop ask plan

Problem: the current consent text is too thin. It says who wants mode access to which target, but does not explain purpose, duration, exact permissions, what is blocked, what to check, or how to deny.

Files to rewrite fully:
- `agent/tools/fs/remoteDesktop/policy.js`
- `agent/tools/fs/remoteDesktop/store.js`
- `agent/tools/fs/actionGroups/remoteDesktopActions.js`
- `agent/testing/remoteDesktopActions.test.cjs`
- `agent/docs/REMOTE_DESKTOP_TUNNEL.md`
- `tunnel-control/js/features/remoteDesktopPanel.js`
- `tunnel-control/js/api/tunnel.js` only if needed to pass new fields.

Better ask shape:
- Purpose / reason is first-class.
- Scope is first-class.
- Requester contact is optional but visible.
- TTL / expires is visible.
- Ask includes explicit question and separate allow/deny labels.
- Ask includes permissions, blocked features, warnings, and pre-grant checklist.
- Watch grant and control grant remain separate.
- Add deny action so refusing is audited, not just absence of consent.

