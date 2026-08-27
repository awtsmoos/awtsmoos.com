//B"H
//Boruch Hashem
//Blessed is He

const { verifyAliasOwnership } = require('../../alias.js');
const { verifyHeichelAuthority } = require('../../heichel.js');
const { getHeichelSubmissionSettings } = require('../../heichelRoles.js');

/**
 * @module GevurahCommentAuthority
 * @description
 * Gevurah guards identity and publication authority before a comment can descend into storage.
 * The Awtsmoos is beyond every border, yet Awtsmoos.com reveals care through measured gates:
 * a truthful alias may pass, a closed heichel may refuse, and an approval path may safely choose.
 */

/**
 * @description Resolves the authenticated user from an explicit legacy value or request session.
 * @param {object} $i Awtsmoos request vessel carrying session identity.
 * @param {string} [userid] Optional explicit legacy user identifier.
 * @returns {string} Resolved user identifier, or an empty string when unauthenticated.
 * @throws {never} Identity absence is represented as an empty value for the caller to reject.
 */
function resolveUserId($i, userid = '') {
	return String(userid || $i?.awtsmoosSession?.user?.id || $i?.moch?.userid || '');
}

/**
 * @description Determines whether creation is direct, submitted for approval, or closed.
 * @param {object} params Authorization inputs.
 * @param {object} params.$i Awtsmoos request vessel used by authority helpers.
 * @param {string} params.aliasId Alias that will author the comment.
 * @param {string} params.userid Authenticated owner identifier.
 * @param {string} params.heichelId Destination heichel identifier.
 * @returns {Promise<{ownsAlias: boolean, hasAuthority: boolean, mode: string, settings: object}>} Explicit creation policy.
 * @throws {Error} Propagates unexpected authority-helper failures for the coordinator to translate.
 */
async function creationAuthority({ $i, aliasId, userid, heichelId }) {
	const ownsAlias = await verifyAliasOwnership(aliasId, $i, userid);
	if (!ownsAlias) {
		return { ownsAlias: false, hasAuthority: false, mode: 'forbidden', settings: {} };
	}
	const hasAuthority = await verifyHeichelAuthority({ heichelId, aliasId, $i });
	if (hasAuthority) {
		return { ownsAlias: true, hasAuthority: true, mode: 'direct', settings: {} };
	}
	const response = await getHeichelSubmissionSettings({ $i, heichelId });
	const settings = response?.success || {};
	if (settings.allowCommentSubmissions === false) {
		return { ownsAlias: true, hasAuthority: false, mode: 'closed', settings };
	}
	const mode = settings.requireCommentApproval === false ? 'direct' : 'submit';
	return { ownsAlias: true, hasAuthority: false, mode, settings };
}

module.exports = {
	creationAuthority,
	resolveUserId
};
