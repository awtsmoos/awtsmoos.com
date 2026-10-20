//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedImportSign
 * @description
 * Ed25519 signature auth for the packed post-import API (bulk import lane).
 *
 * WHY: the operator-key path (AWTSMOOS_IMPORT_KEY env var) is transient — a
 * production restart wipes it, exactly like the old deploy shared secret.
 * A public key baked into this file survives every restart, is auditable in
 * git, and the private key never leaves the VM's persistent disk
 * (~/.awtsmoos/secure/import-signing-key, chmod 600).
 *
 * This is a SEPARATE keypair from the deploy signer, so the import lane can
 * be rotated alone without touching deploys.
 *
 * Wire format (JSON body on POST /packed/import/posts/start):
 *   { ts, sig, op, heichelId, payloadHash, ...normal fields }
 * The signature covers the CANONICAL form of { v:1, ts, op, heichelId, payloadHash }
 * (auth fields excluded). payloadHash binds the actual payload:
 *   - inline mode: sha256 hex of JSON.stringify(body.posts) as received
 *   - staged mode: sha256 hex of the uploadId string
 * Server recomputes payloadHash from the received payload and rejects on
 * mismatch, then verifies the signature. Timestamp window + in-memory replay
 * guard mirror the deploy signer.
 */

const { IMPORT_SIGN_PUBLIC_KEYS, SIGN_VERSION, TIMESTAMP_WINDOW_SEC } = require('./importSignKeys.js');
const { canonicalBytes } = require('./importSignCanonical.js');
const { signPayload, verifySignature, checkTimestamp, checkReplay, sha256hex } = require('./importSignVerify.js');

module.exports = {
	IMPORT_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	canonicalBytes,
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
	sha256hex,
};
