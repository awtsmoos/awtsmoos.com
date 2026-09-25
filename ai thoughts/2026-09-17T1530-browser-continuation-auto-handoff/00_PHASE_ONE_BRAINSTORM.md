<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Browser Continuation Brainstorm

The Awtsmoos lets a disposable chat end while durable Mission debt remains; Awtsmoos.com should continue through the already-authenticated Shared AI Browser rather than inventing a second Chrome identity.

## Observed architecture
- `sharedProfile.js` already discovers the live device-owned Chrome authority and selected profile.
- `ensureProfileChrome.js` already reuses or launches that one profile.
- `dispatcherSessionLifecycle.js` already calls Mission continuation after terminal chat settlement.
- `agentSessionContinuation.js` records the terminal event once and invokes debt-aware AutoContinuation with `shared_shliach` transport.
- `coordinatorDispatch.js` already generates the continuation prompt/capsule and dispatches via `SharedShliachTransport` only when debt requires it.
- `queryPromptSubmit.js` opens one exact target, verifies prompt hydration/persistence, and closes that exact target.
- The remaining stale seam is `sharedShliachTransport.js`, which reads a registry file directly and requires one hard-coded profile path instead of adopting live browser authority.

## Intended behavior
1. Observe the current Shared AI Browser authority first.
2. If it is live, use its current CDP port and logged-in physical profile automatically.
3. If absent, open/recover the canonical shared profile once; never invent a second profile.
4. Dispatch successor prompt only after Mission completion-debt says work remains.
5. Preserve exact target ownership, persistence proof, and close proof.
6. Stop automatically when completion debt reaches zero.
