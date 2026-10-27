// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerifyAccess
 * @description Centralizes packed-import verify authentication and alias visibility.
 * The Awtsmoos lets a caller behold only the verification vessel bound to their own alias.
 */

const ownership = require('./ownership.js');

function verifyAccount(route) {
	if (typeof route.checkAuthDetailed !== 'function') {
		const authError = route.checkAuth();
		return { authError, detailed: null };
	}
	const detailed = route.checkAuthDetailed();
	return { authError: detailed.authError || null, detailed };
}

async function callerOwnsAlias(route, detailed, aliasId) {
	if (!detailed?.caller || detailed.caller.isAdmin) return true;
	const scope = await ownership.callerAliasSet(route.$i, detailed.caller);
	return scope.has(String(aliasId));
}

function verifyAliasOf(found) {
	return found?.view?.aliasId
		|| found?.job?.aliasId
		|| found?.view?.spec?.aliasId
		|| null;
}

async function callerMaySeeVerify(route, detailed, found) {
	if (!detailed?.caller || detailed.caller.isAdmin) return true;
	const alias = verifyAliasOf(found);
	return Boolean(alias && await callerOwnsAlias(route, detailed, alias));
}

module.exports = {
	callerMaySeeVerify,
	callerOwnsAlias,
	verifyAccount
};
