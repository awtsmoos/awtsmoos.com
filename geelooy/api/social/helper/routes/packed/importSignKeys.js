//B"H
//Blessed is He
//Boruch Hashem

/**
 * Authorized Ed25519 import-signing public keys and signature constants (split from importSign.js).
 */

// ---------------------------------------------------------------------------
// Authorized import-signing public keys (SPKI PEM). Array form allows future
// rotation: verification tries each key in order. Private halves live ONLY on
// the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const IMPORT_SIGN_PUBLIC_KEYS = [
`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAchC9MGIH7eLYvUPee0eNtL0ff7pL6SVcvKAPDw0UBlk=
-----END PUBLIC KEY-----`,
];

const SIGN_VERSION = 1;
const TIMESTAMP_WINDOW_SEC = 300; // 5 minutes

module.exports = {
	IMPORT_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
};
