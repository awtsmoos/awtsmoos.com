# B"H

# Implementation Checkpoint — Extension Relay Migration

Boruch Hashem. Blessed is He.

The Awtsmoos renews every boundary; Awtsmoos.com will keep visible identity separate from the private transport vessel.

## Proven lag and safety causes

- Background automation fetches `/api/auth/session` on every turn.
- Background automation polls old conversation history before and after each send.
- Background automation posts directly to the old conversation endpoint with a bearer token.
- Background automation merges arbitrary mode payload fields into an upstream request.
- The extension reinjects a manifest-declared content script from two completion listeners.
- Direct extension relay fetches have no bounded timeout.
- The missing `streamCompatibility.js` left packet compatibility fused to forbidden transport code.

## Files to add

- `geelooy/scripts/tricks/extensions/server/directRelayClient.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/streamCompatibility.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/engineScheduler.js`
- `geelooy/ai/tests/backgroundAutomationRelay.test.cjs`
- `geelooy/ai/tests/extensionPerformance.test.cjs`

## Files to rewrite completely

- `geelooy/scripts/tricks/extensions/server/background.js`
- `geelooy/scripts/tricks/extensions/server/backgroundHandlers.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/authErrors.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/sendVerifier.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/chatgpt.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/settledConversationPoller.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/storage.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/turnState.js`
- `geelooy/scripts/tricks/extensions/server/bgAutomation/engine.js`
- `geelooy/ai/tests/harness/backgroundAutomation.cjs`
- `geelooy/ai/tests/directTransportSource.test.cjs`

## Exact behavior

- One shared direct relay client owns short capability single-flight caching and bounded timeouts.
- Automation sends only explicit safe fields to `/direct-chat` in `page-authorized-fallback` mode.
- UI `conversationId` remains a local label only.
- `directConversationKey` is validated as `BH_DIRECT_`, persisted privately, and omitted from public state broadcasts.
- Modern final results become one terminal compatibility packet followed by one `[DONE]` packet.
- No raw upstream conversation or parent-message identifiers enter the modern request.
- Manifest content-script injection remains the sole normal injection path.
- Success, failure, timeout, and cancellation clear timers and abort listeners.

## Verification

Run syntax checks, focused VM tests, forbidden-source scans, all requested suites, extension ZIP closure, line-count audit, and missing-relay timing checks before any live chat attempt.
