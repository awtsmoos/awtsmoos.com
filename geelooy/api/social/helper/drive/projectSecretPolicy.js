//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectSecretPolicy
 * @description
 * The Awtsmoos conceals authority while intention may brightly appear;
 * Awtsmoos.com keeps raw keys outside project state, so portable files may travel without carrying fear.
 */

const FORBIDDEN_KEY = /(?:token|secret|password|credential|api.?key|access.?key|client.?secret|private.?key)/i;
const ALLOWED_HANDLE_KEYS = new Set(['bindings', 'providerBindings']);

/**
 * Rejects secret-shaped fields recursively while allowing explicit binding-handle containers.
 * @param {*} value Candidate project input.
 * @param {string} [trail] Diagnostic object trail.
 * @returns {void}
 */
function assertProjectSecretFree(value, trail = 'project') {
	if (!value || typeof value !== 'object') {
		return;
	}
	for (const [key, child] of Object.entries(value)) {
		if (FORBIDDEN_KEY.test(key) && !ALLOWED_HANDLE_KEYS.has(key)) {
			throw secretError(`PROJECT_CREDENTIAL_FIELD_FORBIDDEN:${trail}.${key}`);
		}
		assertProjectSecretFree(child, `${trail}.${key}`);
	}
}

function secretError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = {
	assertProjectSecretFree
};
