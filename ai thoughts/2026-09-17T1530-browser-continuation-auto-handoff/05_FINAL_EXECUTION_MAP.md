<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Final Browser Handoff Execution Map

## Whole-file rewrites
1. `geelooy/apps/tunnel/agent/tools/fs/mission/autoContinuation/sharedShliachTransport.js`
   - preserve exact send/persist/close contract;
   - adopt live `sharedProfile.js` authority by default;
   - recover the same canonical profile only when live authority is absent;
   - keep explicit registry override for isolated tests;
   - return browser-source testimony.
2. `geelooy/apps/tunnel/agent/testing/missionContinuationSharedShliach.test.cjs`
   - registry compatibility;
   - live shared-browser preference without launch;
   - offline authority recovery exactly once;
   - close failure remains transport failure.

## Read but intentionally unchanged
- `sharedProfile.js`: canonical device-owned browser authority already exists.
- `queryPromptSubmit.js`: exact target, persistence, and close proof already exists.
- `dispatcherSessionLifecycle.js`: terminal chat already pulses Mission continuation.
- `agentSessionContinuation.js`: terminal event/idempotent debt pulse already exists.
- AutoContinuation debt gate: already stops at zero debt.

## Verification
Syntax, line counts, diff check, shared-Shliach transport, dispatcher-session continuation, agent-session continuation, boot-resume shared-Shliach, zero-debt stop, and live read-only shared-browser authority observation.
