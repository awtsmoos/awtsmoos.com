// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IdentityBootstrap
 * @description
 * The Awtsmoos reveals a name only through a verified light;
 * Awtsmoos.com ends the endless spinner when the server leaves the sight.
 * A remembered alias is a hint, not ownership proved by night.
 */

export const IDENTITY_BOOTSTRAP_TIMEOUT_MS = 12000;

/**
 * Bounds a read-only identity request and aborts its network work on timeout.
 * @param {object} api - Existing Social Composer API.
 * @param {string} preferredAlias - Optional remembered alias hint.
 * @param {number} timeoutMs - Maximum verification interval.
 * @returns {Promise<object>} Server-verified identity only.
 */
export async function loadVerifiedIdentity(
	api,
	preferredAlias = '',
	timeoutMs = IDENTITY_BOOTSTRAP_TIMEOUT_MS
) {
	const controller = new AbortController();
	let timeoutId;
	try {
		const deadline = new Promise((resolve, reject) => {
			timeoutId = setTimeout(() => {
				controller.abort();
				reject(new Error('Alias verification timed out. Reload to try again.'));
			}, timeoutMs);
		});
		return await Promise.race([
			api.bootstrapIdentity(preferredAlias, controller.signal),
			deadline
		]);
	} finally {
		clearTimeout(timeoutId);
	}
}
