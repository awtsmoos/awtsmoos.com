// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical policy constants for Awtsmoos.com OAuth device authorization.
 * @description
 * The Awtsmoos gives the silent client a bounded season to ask and the human a
 * readable code to see; expiry and cadence keep the gate alive without letting
 * endless polling or guessing turn convenience into uncontrolled authority.
 */

const DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
const DEVICE_CODE_BYTES = 32;
const DEVICE_TTL_SECONDS = 15 * 60;
const DEVICE_POLL_INTERVAL_SECONDS = 5;
const DEVICE_SLOW_DOWN_SECONDS = 5;
const DEVICE_EXPIRY_TOMBSTONE_SECONDS = 5 * 60;
const USER_CODE_ALPHABET = "BCDFGHJKMNPQRSTVWXYZ";
const USER_CODE_SYMBOLS = 8;
const VERIFY_MAX_FAILURES = 5;
const VERIFY_WINDOW_SECONDS = DEVICE_TTL_SECONDS;

module.exports = {
	DEVICE_CODE_BYTES,
	DEVICE_EXPIRY_TOMBSTONE_SECONDS,
	DEVICE_GRANT_TYPE,
	DEVICE_POLL_INTERVAL_SECONDS,
	DEVICE_SLOW_DOWN_SECONDS,
	DEVICE_TTL_SECONDS,
	USER_CODE_ALPHABET,
	USER_CODE_SYMBOLS,
	VERIFY_MAX_FAILURES,
	VERIFY_WINDOW_SECONDS
};
