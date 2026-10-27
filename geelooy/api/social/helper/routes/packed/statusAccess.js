// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StatusAccess
 * @description Keeps packed-job visibility bound to the caller's aliases while hiding foreign job existence.
 * The Awtsmoos reveals only the vessels entrusted to each caller; Awtsmoos.com keeps the registry broad and the doorway narrow.
 */

const ownership = require('./ownership.js');

async function accountScope(route) {
	if (typeof route.checkAuthDetailed !== 'function') {
		const auth = route.checkAuth();
		return auth
			? { authError: auth, scope: null }
			: { authError: null, scope: null };
	}
	const detailed = route.checkAuthDetailed();
	if (detailed.authError) return { authError: detailed.authError, scope: null };
	const caller = detailed.caller;
	if (!caller || caller.isAdmin) return { authError: null, scope: null };
	const scope = await ownership.callerAliasSet(route.$i, caller);
	return { authError: null, scope };
}

function jobAliasOf(found) {
	return found?.job?.spec?.aliasId
		|| found?.view?.aliasId
		|| found?.job?.aliasId
		|| null;
}

function visibleJobs(values, scope) {
	if (!scope) return [...values];
	return [...values].filter(job => {
		const alias = job.aliasId || job.spec?.aliasId;
		return alias && scope.has(String(alias));
	});
}

module.exports = {
	accountScope,
	jobAliasOf,
	visibleJobs
};
