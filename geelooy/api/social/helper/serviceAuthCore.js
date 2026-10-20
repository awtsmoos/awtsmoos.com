//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ServiceAuth
 * @description
 * Unified Ed25519 service authentication for the VM/tunnel.
 *
 * WHY: Yaakov's law — "you should be able to use the tunnel authentication to
 * auto log in to any part of Awtsmoos instantly." The VM holds Ed25519 private
 * keys whose public halves are baked into the source (same pattern as
 * packed/deploySign.js and packed/importSign.js). Any API route can call
 * authenticateServiceRequest() to accept the tunnel as an authenticated
 * service actor — no user session, no per-alias Bearer credential needed.
 *
 * Wire format (HTTP headers — works for JSON bodies AND binary PUTs):
 *   x-awtsmoos-service-ts:     <unix seconds>
 *   x-awtsmoos-service-op:     <operation family, e.g. "drive">
 *   x-awtsmoos-service-claims: <base64url JSON, e.g. {"aliasId":"..."}>
 *   x-awtsmoos-service-sig:    <base64 Ed25519 over canonical bytes>
 * The signature covers the CANONICAL form of { v:1, ts, op, claims }
 * (auth fields excluded). Server rejects when |now - ts| > 300s and keeps a
 * short in-memory set of seen signatures to reject exact replays.
 *
 * Security properties:
 * - op binds the signature to one API family (a drive signature cannot be
 *   replayed against another API).
 * - claims bind route specifics; callers SHOULD pass expectedClaims
 *   (e.g. { aliasId }) so a signature for alias A cannot drive alias B.
 * - The private keys never leave the VM (~/.awtsmoos/secure/, chmod 600).
 * - Public keys are baked here, auditable in git, survive restarts.
 *
 * REUSABLE PATTERN for other routes:
 *   const { authenticateServiceRequest, hasServiceAuthHeaders } = require('../serviceAuth.js');
 *   // in your auth gate, BEFORE user-session checks:
 *   if (hasServiceAuthHeaders(req.headers)) {
 *     const r = authenticateServiceRequest(req.headers, {
 *       expectedOp: 'mydomain',            // required: op must match
 *       expectedClaims: { tenant: 'x' },   // optional: claims must include these
 *       grantScopes: ['mydomain.write'],   // scopes the service actor receives
 *       actorLabel: 'vm-service-key',      // optional credential label
 *     });
 *     if (!r.ok) throw authError(r.error, r.statusCode);
 *     // r.actor = { actorType:'service', actorUserId:null, aliasId, credentialId, scopes }
 *   }
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Authorized VM service public keys (SPKI PEM). Array form allows rotation:
// verification tries each key in order. These are the same keys trusted for
// packed deploys and bulk imports — the operator's own machine. Private
// halves live ONLY on the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const SERVICE_SIGN_PUBLIC_KEYS = [
	// deploy-signing-key.pub
	`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOlCMD31JidPI9EJrnMJG49el4Ajd8EQHsuMD0OW9knM=
-----END PUBLIC KEY-----`,
	// import-signing-key.pub
	`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAchC9MGIH7eLYvUPee0eNtL0ff7pL6SVcvKAPDw0UBlk=
-----END PUBLIC KEY-----`,
];

const SIGN_VERSION = 1;
const TIMESTAMP_WINDOW_SEC = 300; // 5 minutes

const HDR_TS = 'x-awtsmoos-service-ts';
const HDR_OP = 'x-awtsmoos-service-op';
const HDR_CLAIMS = 'x-awtsmoos-service-claims';
const HDR_SIG = 'x-awtsmoos-service-sig';

module.exports = {
	SERVICE_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	HDR_TS,
	HDR_OP,
	HDR_CLAIMS,
	HDR_SIG
};
