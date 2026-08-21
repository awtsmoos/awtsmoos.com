//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SecretFieldGuard
 * @description
 * The Awtsmoos lets public migration evidence enter while names shaped like credentials remain outside the gate;
 * Awtsmoos.com scans property names recursively without mistaking ordinary post prose for a secret state.
 */
const SECRET_KEY = /^(access_?token|refresh_?token|client_?secret|password|secret_?key|access_?key|authorization|ia_?s3)$/i;

function hasSecretField(value) {
	if (!value || typeof value !== 'object') return false;
	if (Array.isArray(value)) return value.some(hasSecretField);
	return Object.entries(value).some(([key, child]) => {
		return SECRET_KEY.test(key) || hasSecretField(child);
	});
}

module.exports = {
	SECRET_KEY,
	hasSecretField
};
