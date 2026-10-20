//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedDeploySign
 * @description
 * Ed25519 signature auth for the packed deploy API (MAC-SEVERANCE Phase 2).
 *
 * WHY: the old shared-secret (AWTSMOOS_DEPLOY_KEY env var) was wiped by a
 * production restart — env vars are transient. A public key baked into this
 * file survives every restart, is auditable in git, and the private key never
 * leaves the VM's persistent disk (~/.awtsmoos/secure/deploy-signing-key).
 *
 * Wire format (JSON body on POST /packed/deploy/push and /packed/deploy/restart):
 *   { ts: <unix seconds>, message: <string>, files: [...], sig: <base64 Ed25519> }
 * The signature covers the CANONICAL form of { v:1, ts, message, files }
 * (auth fields excluded). Server rejects when |now - ts| > TIMESTAMP_WINDOW_SEC
 * (stale/replay guard) and keeps a short in-memory set of seen signatures to
 * reject exact replays inside the window.
 *
 * Both the production route and the VM signer (scripts/vmDeploySigned.mjs)
 * use this one module, so the canonical bytes can never drift.
 */

const { DEPLOY_SIGN_PUBLIC_KEYS, SIGN_VERSION, TIMESTAMP_WINDOW_SEC } = require('./deploySignKeys.js');
const { canonicalBytes } = require('./deploySignCanonical.js');
const { signPayload, verifySignature, checkTimestamp, checkReplay } = require('./deploySignVerify.js');

module.exports = {
	DEPLOY_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	canonicalBytes,
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
};
