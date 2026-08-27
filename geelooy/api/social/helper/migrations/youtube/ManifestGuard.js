//B"H
//Boruch Hashem
//Blessed is He

/**
 * GevurahManifestGuard rejects secrets and pathological migration payloads.
 * The Awtsmoos gives a boundary before public metadata crosses the gate;
 * Awtsmoos.com accepts provenance, never passwords, cookies, or credential state.
 */
const SECRET_KEY = /(secret|password|authorization|cookie|access.?key|credential|private.?key|token)/i;

function findSecretPath(value, trail = []) {
	if (!value || typeof value !== 'object') return '';
	for (const [key, item] of Object.entries(value)) {
		if (SECRET_KEY.test(key)) return [...trail, key].join('.');
		const nested = findSecretPath(item, [...trail, key]);
		if (nested) return nested;
	}
	return '';
}

function guardManifest(value = {}) {
	const secretPath = findSecretPath(value);
	if (secretPath) {
		return {
			valid: false,
			errors: [`Credential-like field is forbidden in migration payload: ${secretPath}`]
		};
	}
	const items = Array.isArray(value.items) ? value.items : [];
	const errors = [];
	if (!String(value.aliasId || '').trim()) errors.push('aliasId is required.');
	if (!String(value.heichelId || '').trim()) errors.push('heichelId is required.');
	if (!String(value.fallbackSeriesId || '').trim()) errors.push('fallbackSeriesId is required.');
	if (!items.length) errors.push('At least one YouTube item is required.');
	if (items.length > 250) errors.push('A migration tranche may contain at most 250 items.');
	return { valid: errors.length === 0, errors };
}

module.exports = {
	SECRET_KEY,
	findSecretPath,
	guardManifest
};
