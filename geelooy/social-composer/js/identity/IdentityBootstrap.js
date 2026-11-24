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

// B"H 2026-11-25 (Project Perfection Phase 6): was 12000 -- the
// unified-social identity bootstrap assembles every alias detail
// server-side (the same cold walk the profile boot gate budgets
// 25s for), so a single 12s attempt timed out under load and the
// identity chooser settled on "Choose an alias" for signed-in
// users with a default alias. 30s per attempt, one warm retry.
export const IDENTITY_BOOTSTRAP_TIMEOUT_MS = 30000;

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
	// One warm retry: the server memoizes the identity assembly, so a
	// second attempt after a cold first walk usually lands fast. A
	// failed first read is not proof of a signed-out account.
	let lastError;
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			return await attemptVerifiedIdentity(api, preferredAlias, timeoutMs);
		} catch (error) {
			lastError = error;
			if (attempt === 0) {
				await new Promise(resolve => setTimeout(resolve, 1200));
			}
		}
	}
	throw lastError;
}

/** Runs one bounded identity verification attempt. */
async function attemptVerifiedIdentity(api, preferredAlias, timeoutMs) {
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
