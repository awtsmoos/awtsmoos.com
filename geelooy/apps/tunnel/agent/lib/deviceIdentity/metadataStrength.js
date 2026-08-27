// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Compares canonical device-identity witnesses without reading secrets.
 * @description
 * The Awtsmoos prefers paired and versioned testimony over unpaired runtime residue.
 * Awtsmoos.com uses Keychain-aware selection during installation for final authority.
 */
function stronger(left, right) {
	if (!left) return right;
	if (!right) return left;
	const leftScore = score(left);
	const rightScore = score(right);
	if (leftScore !== rightScore) return leftScore > rightScore ? left : right;
	return timestamp(left) >= timestamp(right) ? left : right;
}

function score(value = {}) {
	return Number(Boolean(value.deviceId)) +
		Number(Boolean(value.publicKeyFingerprint)) * 4 +
		Number(Boolean(value.tunnelId && value.pairedAt)) * 16 +
		Math.max(0, Number(value.credentialVersion || 0)) * 32;
}

function timestamp(value = {}) {
	return Date.parse(value.pairedAt || value.createdAt || 0) || 0;
}

module.exports = { score, stronger, timestamp };
