<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Improved Browser Handoff Plan

The Awtsmoos renews the messenger without multiplying identity; Awtsmoos.com should carry unfinished Mission debt into the browser the user is already authenticated in.

## Execution
1. Preserve terminal chat → `agentSessionContinuation` → debt-aware AutoContinuation unchanged.
2. Rewrite `sharedShliachTransport.js` completely.
3. Prefer the live `sharedProfile.js` device authority when it reports a valid CDP port.
4. If authority is absent, call that same shared-profile abstraction's `open()` once, then re-observe authority.
5. Never guess a CDP port or create another physical profile.
6. Keep explicit registry injection/override only for isolated tests and backward compatibility.
7. Preserve query-prompt persistence proof and exact target close proof.
8. Return browser source testimony (`live`, `recovered`, or `registry`) in the continuation receipt.
9. Rewrite the focused shared-Shliach test to prove live preference, recovery fallback, registry compatibility, and close-failure rejection.
10. Run terminal-session, boot-resume, zero-debt, shared-Shliach, and continuation regression suites.

## Acceptance
- Logged-in shared Chrome already live → no browser launch/recovery call occurs.
- Shared Chrome absent → canonical shared profile is opened exactly once, then used.
- Unfinished debt → successor prompt reaches a persisted account conversation.
- Zero debt → no successor dispatch.
- Only the exact successor target is closed.
