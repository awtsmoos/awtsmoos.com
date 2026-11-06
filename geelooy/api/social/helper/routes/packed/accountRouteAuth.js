//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file accountRouteAuth.js
 * @description
 * Bulk-upload redesign §3.7: finish the Oct 26 front door on the
 * remaining operator-only posts routes (cancel, remove, ensure-backlinks,
 * backlinks-status, flush-backlinks). An admin (signature, OAuth
 * operator, or operator key) passes exactly as before. Any other
 * authenticated Awtsmoos user passes too, but only for their OWN jobs:
 * foreign jobs return JOB_NOT_FOUND, never a permission error, so
 * existence does not leak. Unauthenticated callers get the historic
 * operator-grade rejection, byte-identical.
 */

const { accountScope, jobAliasOf } = require('./statusAccess.js');

/**
 * Authorize one job-scoped route call.
 * Returns { admin, scope, authError } — authError is the historic
 * operator rejection for unauthenticated callers; scope is null for
 * admin, a Set of the caller's alias ids otherwise.
 */
async function authorizeJobRoute(route) {
	const adminAuth = route.checkAuth();
	if (!adminAuth) return { admin: true, scope: null, authError: null };
	const account = await accountScope(route);
	if (account.authError) return { admin: false, scope: null, authError: adminAuth };
	return { admin: false, scope: account.scope, authError: null };
}

/** True when a scoped (non-admin) caller may see this job view. */
function jobVisibleToScope(found, scope) {
	if (!scope) return true;
	const alias = jobAliasOf(found);
	return !!alias && scope.has(String(alias));
}

/** The JOB_NOT_FOUND reply used for foreign jobs (existence must not leak). */
function foreignJobError(jobId) {
	return { success: false, error: 'JOB_NOT_FOUND', jobId };
}

module.exports = {
	authorizeJobRoute,
	foreignJobError,
	jobVisibleToScope
};
