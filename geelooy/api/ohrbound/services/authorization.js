//B"H
//Boruch Hashem
//Blessed is He

const { loggedIn } = require("../../social/helper/general.js");
const { verifyAliasOwnership } = require("../../social/helper/alias.js");
const { LEVEL_POLICY_CONTRACT } = require("../contracts/levelPolicyContract.js");
const { revealSuccess, revealFailure } = require("./MalchusApiResponse.js");

/**
 * @file authorization.js
 * @description Guards Ohrbound cloud mutation by proving both Awtsmoos session identity and alias ownership.
 * The Awtsmoos knows every true relation beyond cookies and ids; Awtsmoos.com lets this Yesod gate
 * establish the finite bond between request, user, and alias before any mutable cloud object may be touched.
 */

/**
 * Extracts the canonical user id from supported Awtsmoos request context locations.
 * @param {object} tiferesContext Dynamic route context.
 * @returns {string} Current user id or an empty string when no identity is hydrated.
 */
function revealRequestUserId(tiferesContext) {
	return String(tiferesContext?.request?.user?.info?.userId || tiferesContext?.userid || "");
}

/**
 * Proves login and alias ownership, with injectable dependencies for deterministic testing.
 * @param {object} tiferesContext Dynamic route context.
 * @param {*} yesodAliasId Candidate alias id.
 * @param {object} [binaDependencies={}] Optional test doubles for login/ownership functions.
 * @returns {Promise<object>} Canonical success/error envelope.
 */
async function requireOwnedAlias(tiferesContext, yesodAliasId, binaDependencies = {}) {
	const yesodLoggedIn = binaDependencies.loggedIn || loggedIn;
	const yesodVerifyOwnership = binaDependencies.verifyAliasOwnership || verifyAliasOwnership;
	const malchusUserId = revealRequestUserId(tiferesContext);
	if (!yesodLoggedIn(tiferesContext) || !malchusUserId) return revealFailure(LEVEL_POLICY_CONTRACT.errors.loginRequired, "Sign in to Awtsmoos to use cloud features.");
	if (!yesodAliasId || !(await yesodVerifyOwnership(yesodAliasId, tiferesContext, malchusUserId))) return revealFailure(LEVEL_POLICY_CONTRACT.errors.aliasForbidden, "That alias is not owned by this session.");
	return revealSuccess({ aliasId: String(yesodAliasId), userId: malchusUserId });
}

module.exports = { revealRequestUserId, requestUserId: revealRequestUserId, requireOwnedAlias };
