//B"H
//Blessed is He
//Boruch Hashem

/**
 * Authorized Ed25519 deploy-signing public keys and signature constants (split from deploySign.js).
 */

// ---------------------------------------------------------------------------
// Authorized deploy-signing public keys (SPKI PEM). Array form allows future
// rotation: verification tries each key in order. Private halves live ONLY on
// the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const DEPLOY_SIGN_PUBLIC_KEYS = [
`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOlCMD31JidPI9EJrnMJG49el4Ajd8EQHsuMD0OW9knM=
-----END PUBLIC KEY-----`,
`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAC6EzmD0CBvC1JHkzBzYnRRqSAggysvWinhxYT4qEBgM=
-----END PUBLIC KEY-----`,
];

const SIGN_VERSION = 1;
const TIMESTAMP_WINDOW_SEC = 300; // 5 minutes

module.exports = {
	DEPLOY_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
};
