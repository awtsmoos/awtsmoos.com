B"H — Boruch Hashem — Blessed is He
# Release gate: authentic OAuth signing key missing from running server
The Awtsmoos gives the signed identity a unique guarded flame; a predictable legacy placeholder must never govern a cross-account filesystem deed.

## Actual evidence
- Linux canonical main on disk `4a3b3761e3546497d1d3f7812cb0529d930e6b93`, running service remained on previous source `68d7a9cd84cda18965b7275ab9a8aeaa5976cbdc` in `AWTSMOOS_RELEASE_SOURCE_SHA`; GitHub `origin/main` still old SHA, missing noninteractive push credentials.
- `index.js` constructs `new AwtsServer(__dirname, ...)`. `ayzarim/awtsmoos.config.json` resolves its secret reference to a file **outside the repo**, currently missing with missing parent folder. Read-only runtime-equivalent command `cmdjob_mw0eg3bi_7e8c3fa2ad7a` verified `{configuredPathExists:false,fallbackUsed:true,loadedConfiguredSecret:false}`. Never print actual signing data.
- Original `server/authSetup.js::loadSecret()` substitutes an easily reproducible legacy fallback object when `require(directory + config.secret)` fails. Existing HTTP behavior continues to accept it and may issue or verify insecure tokens. A WebSocket lane permitting filesystem transfers MUST NOT accept that fallback as OAuth proof. This is security-critical and pre-existing; it must not be bypassed simply to show a successful CLIENT_ACK.

## Whole-file fail-closed correction, currently in isolated branch
- Rewrote `ayzarim/awtsmoosDynamicServer/server/authSetup.js` entirely, now 51 lines. It shares a secret with the WebSocket server **only** when `trustedSigningKey` finds a configured non-fallback secret object, otherwise `server.ws.secret=null`. Existing HTTP legacy behavior remains unchanged until an approved auth rotation.
- Rewrote `server/authSocketOAuthIntegration.test.cjs` entirely, now 74 lines. It verifies signed external-agent bearer sharing the true key, denies wrong signature, denies missing secret and denies a bearer signed by the legacy placeholder. Command `cmdjob_mw0eihf3_df9c0ba3001a` exited zero with `legacyFallbackDenied:true`; all 8 binary WS tests and 2 legacy socket tests had already passed before this correction and should be rerun before commit.
- No tokens or keys displayed in output or added to Git. No production service restart or credential changes performed.

## Remaining proof before declaring live
1. Securely restore or install the strong configured signing secret in the correct outside-repo path, with restrictive filesystem mode and an owner-approved OAuth session/token rotation. Rotation invalidates previously issued OAuth tokens and may disconnect currently running external agents (including the ChatGPT tunnel connector), so never silently perform it. Consider verified backup plus staged rollout before changing anything.
2. Configure `AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT` to point to the **same existing private vault** as the HTTP artifact endpoints, `/root/.awtsmoos-private/binary-incoming` (verified uid0 mode700), otherwise the device cannot redeem client upload capabilities.
3. Obtain authenticated non-force GitHub publication of exact local release SHA, align service `AWTSMOOS_RELEASE_SOURCE_SHA`, controlled restart with proven rollback, verify public raw-client CLIENT_ACK with actual *issued* external-agent OAuth token (no pairing/admin), 10MiB Mac and Linux native upload and download end-to-end hashes, reconnect/resume and measured throughput vs GET/Base64.
4. Separate the persistent Mac/Linux tunnel stall-recovery problem from raw WebSocket client transport; do not equate green transport heartbeats with accepted command receipts.

Status: local source implementation and tests are real; production raw WebSocket client is NOT LIVE and no production credential rotation has been performed.
