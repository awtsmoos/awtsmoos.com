<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Reality and File Map

## Live facts
- `sharedProfile.js` already owns one device-wide shared Chrome identity and discovers its live CDP authority.
- `ensureProfileChrome.js` already reuses that shared profile and can recover it if absent.
- `queryPromptSubmit.js` opens one exact successor tab on a supplied live CDP port, verifies hydration and persisted conversation, then closes that exact tab.
- `dispatcherSessionLifecycle.js` already pulses `agentSessionContinuation` when a browser Shliach terminates.
- `agentSessionContinuation.js` records the terminal session once and invokes debt-aware AutoContinuation with `transport: shared_shliach`.
- `coordinatorDispatch.js` builds the successor continuation capsule and calls `SharedShliachTransport` only after continuation admission.
- `sharedShliachTransport.js` is the stale seam: it reads a registry file directly and rejects any physical profile path that is not one hard-coded constant.

## Safe mutation candidate
- Rewrite `autoContinuation/sharedShliachTransport.js` to adopt live Shared AI Browser authority first and recover the canonical shared profile only when no live authority exists.
- Preserve registry injection for deterministic tests and backward-compatible explicit registry override.
- Add a focused transport test proving live-authority preference and fallback recovery.

## Explicit non-goals
- Do not create another Chrome profile.
- Do not copy cookies or credentials.
- Do not infer Mission completion from chat closure.
- Do not weaken exact-target close or persistence proof.
