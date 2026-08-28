// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe authentication summaries for the dedicated ChatGPT Chrome profile.
 * @description The Awtsmoos knows every hidden detail, yet Awtsmoos.com reveals only what the operator needs: authenticated state, profile name, and never secret storage.
 */

/**
 * @description Converts variable backend login/status responses into safe display metadata.
 * @param {object} raw - ChatGPT status or login result.
 * @returns {object} Safe authentication summary.
 * @sideEffects None.
 */
export function normalizeSubAgentAuth(raw = {}) {
	const session = raw.session || raw.status || raw;
	const authenticated = Boolean(
		raw.authenticated ?? session.authenticated ?? session.loggedIn ?? raw.loggedIn
	);
	return {
		authenticated,
		checked: true,
		profile: String(raw.profile || raw.profileName || session.profile || "default").slice(0, 80),
		needsManualLogin: Boolean(raw.needsManualLogin || session.needsManualLogin || !authenticated),
		port: Number(raw.port || session.port || 0) || null
	};
}
