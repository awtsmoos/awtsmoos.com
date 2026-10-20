//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedDeployRoutes
 * @description
 * VM-direct deploy API for Awtsmoos.com production.
 *
 * WHY THIS EXISTS: the VM cannot SSH to production (egress proxy blocks port 22)
 * and has no GitHub credentials. This API lets the VM push files directly to
 * production over HTTPS, authenticated by Ed25519 request signatures — no Mac,
 * no GitHub, no shared secrets.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/deploy/push   — write files to the production working tree
 *   GET  /packed/deploy/status — check the API is live and configured
 *   POST /packed/deploy/restart — restart the production service (MAC-SEVERANCE)
 *
 * Push body (Ed25519 signature auth, MAC-SEVERANCE Phase 2):
 *   { ts: <unix seconds>, message: <string>, files: [...], sig: <base64> }
 *   sig = Ed25519(privateKey, canonical({v:1, ts, message, files})).
 *   |now - ts| must be <= 300s; exact replays inside the window are rejected.
 *   The old shared-secret operatorKey path is GONE — removed at cutover.
 *
 * Safety:
 * - Signature auth, fail-closed. Public key baked into deploySign.js:
 *   survives restarts, auditable in git. Private key lives only on the VM.
 * - Path traversal rejected: paths must resolve inside the repo working tree.
 * - Blocked paths: .git/, node_modules/, secrets, env files, anything outside allowlist roots.
 * - Per-file size cap (5 MB) and per-request file cap (50 files).
 * - Every push is logged to the deploy log.
 *
 * NOTE: files are written directly to the working tree. Server-side Node.js
 * changes require a service restart to take effect; HTML/CSS/client-JS and
 * templates are picked up on the next request without a restart.
 */

const { PackedDeployRoutes } = require('./deployRoutesClass.js');
Object.assign(PackedDeployRoutes.prototype, require('./deployRoutesRestart.js'));
Object.assign(PackedDeployRoutes.prototype, require('./deployRoutesPush.js'));

module.exports = { PackedDeployRoutes };
