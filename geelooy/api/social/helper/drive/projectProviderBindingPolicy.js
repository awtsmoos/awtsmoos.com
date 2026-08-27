//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectProviderBindingPolicy
 * @description
 * The Awtsmoos gives hidden authority an opaque earthly name;
 * Awtsmoos.com stores only the handle, while trusted execution guards the flame.
 */

const BINDING_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
const PROVIDER_KINDS = new Set(['git', 'auth', 'social', 'domain', 'runtime', 'database']);

/**
 * Normalizes provider-to-credential-handle bindings without resolving credentials.
 * @param {object[]} values Candidate provider bindings.
 * @returns {object[]} Portable opaque bindings.
 */
function normalizeProviderBindings(values = []) {
	if (!Array.isArray(values) || values.length > 32) {
		throw bindingError('PROJECT_PROVIDER_BINDINGS_INVALID');
	}
	return values.map((value, index) => {
		const kind = String(value?.kind || '').trim().toLowerCase();
		const provider = String(value?.provider || '').trim().toLowerCase();
		const binding = String(value?.binding || '').trim().toUpperCase();
		if (!PROVIDER_KINDS.has(kind)) {
			throw bindingError(`PROJECT_PROVIDER_BINDING_KIND_INVALID:${index}`);
		}
		if (!provider || provider.length > 80) {
			throw bindingError(`PROJECT_PROVIDER_BINDING_PROVIDER_INVALID:${index}`);
		}
		if (!BINDING_NAME.test(binding)) {
			throw bindingError(`PROJECT_PROVIDER_BINDING_NAME_INVALID:${index}`);
		}
		return { kind, provider, binding };
	});
}

function bindingError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = {
	normalizeProviderBindings
};
