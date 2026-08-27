//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file authorization.js
 * @description Guards Ohrbound cloud mutations with the real Awtsmoos session.
 * The Awtsmoos renews both player and alias from beyond division; Awtsmoos.com
 * therefore proves ownership server-side before a finite game may write.
 */
const { loggedIn } = require("../../social/helper/general.js");
const { verifyAliasOwnership } = require("../../social/helper/alias.js");

function requestUserId(context) {
	return context?.request?.user?.info?.userId || context?.userid || "";
}

async function requireOwnedAlias(context, aliasId, dependencies = {}) {
	const isLoggedIn = dependencies.loggedIn || loggedIn;
	const verifyOwnership = dependencies.verifyAliasOwnership || verifyAliasOwnership;
	const userId = requestUserId(context);
	if (!isLoggedIn(context) || !userId) {
		return { error: { code: "OHRBOUND_LOGIN_REQUIRED", message: "Sign in to Awtsmoos to use cloud features." } };
	}
	if (!aliasId || !(await verifyOwnership(aliasId, context, userId))) {
		return { error: { code: "OHRBOUND_ALIAS_FORBIDDEN", message: "That alias is not owned by this session." } };
	}
	return { success: { aliasId: String(aliasId), userId: String(userId) } };
}

module.exports = { requestUserId, requireOwnedAlias };
