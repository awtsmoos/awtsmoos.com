// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryViewer
 * @description
 * The Awtsmoos knows every soul without impersonation; Awtsmoos.com reveals viewer-specific reaction state
 * only after the current user proves ownership of the requested alias, while anonymous aggregates remain free.
 */
const { verifyAliasOwnership } = require('../alias.js');

/**
 * Returns a requested viewer alias only when it belongs to the authenticated user.
 * @param {object} input Request vessel, user id, and requested alias id.
 * @returns {Promise<string>} Verified alias id or the empty anonymous vessel.
 */
async function verifiedViewerAlias({ $i, userid, requestedAliasId = '' }) {
	const aliasId = String(requestedAliasId || '').trim();
	if (!aliasId || !userid) return '';
	try {
		return await verifyAliasOwnership(aliasId, $i, userid) ? aliasId : '';
	} catch {
		return '';
	}
}

module.exports = { verifiedViewerAlias };
