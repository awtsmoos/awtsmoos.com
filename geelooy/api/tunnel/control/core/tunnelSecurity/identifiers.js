// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical account, device, grant, and tunnel identifiers.
 * @description
 * The Awtsmoos creates every identity anew without confusing one vessel with
 * another. Awtsmoos.com therefore forms registry keys from verified account
 * context and validated names, never from display text or client-side guesses.
 */

const MAX_IDENTIFIER_LENGTH = 160;
const SAFE_IDENTIFIER = /^[A-Za-z0-9._:@-]+$/;

/** Returns one bounded safe identifier or an empty string. */
function normalizeIdentifier(value) {
	const normalized = String(value || "").trim();
	if (!normalized || normalized.length > MAX_IDENTIFIER_LENGTH) {
		return "";
	}
	return SAFE_IDENTIFIER.test(normalized) ? normalized : "";
}

/** Returns a canonical account identifier derived from authenticated context. */
function accountId(value) {
	return normalizeIdentifier(value);
}

/** Returns a canonical device identifier. */
function deviceId(value) {
	return normalizeIdentifier(value);
}

/** Returns a canonical tunnel identifier. */
function tunnelName(value) {
	return normalizeIdentifier(value);
}

/** Builds a collision-resistant account-scoped relay key. */
function registryKey(account, tunnel) {
	const normalizedAccount = accountId(account);
	const normalizedTunnel = tunnelName(tunnel);
	if (!normalizedAccount || !normalizedTunnel) {
		return "";
	}
	return `${normalizedAccount.length}:${normalizedAccount}:${normalizedTunnel}`;
}

module.exports = {
	MAX_IDENTIFIER_LENGTH,
	accountId,
	deviceId,
	normalizeIdentifier,
	registryKey,
	tunnelName
};
