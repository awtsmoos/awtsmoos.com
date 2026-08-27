//B"H
//Boruch Hashem
//Blessed is He

const { isArchiveOrgPublicPath } = require('../ArchiveOrgPublicAsset.js');

/**
 * GevurahManifestGuard rejects secrets and non-canonical remote video before planning.
 * The Awtsmoos keeps local IA-S3 keys beyond the server gate while public Archive.org light may enter;
 * Awtsmoos.com accepts provenance and canonical download URLs, never passwords, cookies, tokens, or credential center.
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

function itemErrors(item, index) {
	const errors = [];
	const mediaUrl = String(item?.archive?.mediaUrl || '').trim();
	if (mediaUrl && !isArchiveOrgPublicPath(mediaUrl)) {
		errors.push(`items[${index}].archive.mediaUrl must be a canonical Archive.org download URL.`);
	}
	return errors;
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
	for (const [index, item] of items.entries()) {
		errors.push(...itemErrors(item, index));
	}
	return { valid: errors.length === 0, errors };
}

module.exports = {
	SECRET_KEY,
	findSecretPath,
	itemErrors,
	guardManifest
};
