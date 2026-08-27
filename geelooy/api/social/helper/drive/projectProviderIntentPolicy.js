//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectProviderIntentPolicy
 * @description
 * The Awtsmoos lets public provider desire take a bounded name and frame;
 * Awtsmoos.com records where work should flow without confusing intention with the secret flame.
 */

const PROVIDER_KINDS = new Set(['git', 'auth', 'social', 'domain', 'runtime', 'database']);

/**
 * Normalizes secret-free provider intentions.
 * @param {object[]} values Candidate provider intentions.
 * @returns {object[]} Normalized public intentions.
 */
function normalizeProviderIntents(values = []) {
	if (!Array.isArray(values) || values.length > 32) {
		throw providerError('PROJECT_PROVIDER_INTENTS_INVALID');
	}
	return values.map(value => {
		const kind = String(value?.kind || '').trim().toLowerCase();
		const provider = String(value?.provider || '').trim().toLowerCase();
		if (!PROVIDER_KINDS.has(kind)) {
			throw providerError('PROJECT_PROVIDER_KIND_INVALID');
		}
		if (!provider || provider.length > 80) {
			throw providerError('PROJECT_PROVIDER_INVALID');
		}
		return {
			kind,
			provider,
			id: String(value?.id || provider).trim().slice(0, 160),
			mode: String(value?.mode || 'default').trim().slice(0, 40)
		};
	});
}

function providerError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	normalizeProviderIntents
};
