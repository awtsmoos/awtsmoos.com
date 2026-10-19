B"H

# Production tunnel stability follow-up — 2026-10-19

## Changes actually applied

- Corrected `geelooy/api/tunnel/control/core/apiKeyStore.js`: authenticated API-key identity exposes a verified `clientId`, not a `keyId`. The admission/rate-limit gate now resolves `identity.clientId || identity.keyId`, retaining legacy internal compatibility. Prior code could reject a valid API key with `api_key_revoked_or_missing` before native WebSocket dispatch.
- Added isolated regression in `core/test/apiKeyStoreAtomicExpiry.test.cjs` using the same `identityRecord({kind:'apiKey',clientId:...})` shape as the HTTP authentication result. The isolated key store retains expiration, rate-limit, byte limit, and revocation coverage.
- Preserved a newer production-only optimized reverse scan of chronological usage events and the legacy ledger. An initial full-file deployment was **deliberately aborted** when a byte-for-byte comparison showed it would overwrite that optimization. The reconciled source was tested and committed, and the exact minimal optimized replacement was deployed.
- Production `awtsmoos.service` restarted once for the new authentication module. The service and independent `awtsmoos-tunnel-guardian.service` returned active; agents remained at v1.0.687. Initial startup HTTP attempts briefly exceeded 2-3 seconds before normal response resumed.
- Earlier in this maintenance sequence, 42 unused August 2 `uv` package-cache archive entries were cleared, freeing 4.6 GiB on `/`; no site content, job receipt, or recovery directory was removed. The obsolete failed emergency unit was disabled with its original unit backed up; the independent guardian remained running.

## Reproducible evidence

- `node geelooy/api/tunnel/control/core/test/apiKeyStoreAtomicExpiry.test.cjs` — pass.
- `node geelooy/api/tunnel/control/routes/fsVessel/test/accountScopedRelayEndToEnd.test.cjs` — pass (isolated account-scoped simulated WebSocket relay).
- `node --test .../apiKeyStoreAtomicExpiry.test.cjs .../tunnelPayloadRetryIdentity.test.cjs` — pass.
- After website restart, Mac native agent v1.0.687 returned exact stdout with exit 0 for **5/5** loopback command runs (11-84 ms); Linux agent v1.0.687 likewise **5/5** (9-20 ms).
- **90/90** HTTP calls to production local website and installer manifest succeeded with six concurrent requests per batch. Timing: p50 32 ms, p95 206 ms, maximum 266 ms. This is a burst test, not a long continuous soak.
- Production website subsequently returned 10/10 HTTP 200 responses in 9-62 ms. Both website service and guardian were active. `NODE_ENV=production` was confirmed in systemd service environment, activating the existing fail-closed installer ZIP-cache safeguard.
- Root disk stabilized at **75% utilization**, 9.3 GB available; content volume remained **89% utilized**, 7.4 GB available.

## Source and rollback

- GitHub `main` source commits: `f8f2a9125` (normalized verified identity) and `f2c9e3be9` (reconciled optimized source).
- Server changed path: `/mnt/HC_Volume_102267213/git/awtsmoos.com/geelooy/api/tunnel/control/core/apiKeyStore.js`; deployed SHA-256 `fed27d774945da1455e453f1cd64acd083223bde87651120ab10c28b68bd3539`.
- Before-change server copy: `/root/awtsmoos-stability-20261019/apiKeyStore.optimized-before-clientid-fix.js`. The earlier server copy deliberately preserves the old identity bug, so restore only if needed for immediate rollback and reapply the identity fix afterward.
- The main checkout has unrelated in-progress glyph-engine changes in `index.js` and other paths; none were staged, overwritten or deployed by this fix.

## Remaining proof boundary

- **Not yet proven** in this session: a fully authorized production HTTP API-key command that traverses the hosted account router, WebSocket, physical agent execution and terminal result in one observed transaction. The live agents and isolated relay simulations were verified separately. Do not describe them as full hosted end-to-end proof.
- **Not yet performed**: a disruptive in-flight mutation fault-injection test; do not risk unknown real jobs for an uncontrolled demonstration.
- A longer-duration soak with production incident telemetry is still appropriate for ongoing operational confidence. No finite test establishes permanent future stability.
- Preserve installed v1.0.687 release provenance. Do not blindly force-pull the dirty production checkout or delete its backups or queued work.
