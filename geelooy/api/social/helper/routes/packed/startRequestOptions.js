//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file startRequestOptions.js
 * @description
 * The Awtsmoos gathers many request channels into one truthful vessel;
 * Awtsmoos.com keeps admission parsing small so policy and execution never wrestle.
 */

const { requestValue } = require('./requestValues.js');

/** Resolve a JSON/body value first, then the packed-route request fallback. */
function bodyOrRequest($i, body, key, fallback = '') {
	return body[key] ?? requestValue($i, key, fallback);
}

/** Normalize one request truth value that may arrive as boolean or string. */
function requestBoolean(value) {
	return value === true || value === 'true';
}

/**
 * Parse the established start-route options without applying load-shed policy.
 * Execution budgets remain safety watchdog inputs, not admission permission.
 */
function startRequestOptions($i) {
	const body = $i?.body || {};
	const heichelId = body.heichelId || requestValue($i, 'heichelId') || 'ikar';
	const dryRun = requestBoolean(bodyOrRequest($i, body, 'dryRun'));
	const jobAliasId = String(
		body.aliasId || requestValue($i, 'aliasId') || (heichelId + '-import')
	);
	const jobAliasName = String(
		body.aliasName || requestValue($i, 'aliasName') || (heichelId + ' Import')
	);
	const requestedBudget = Number(body.timeBudgetMs);
	const timeBudgetMs = Math.min(
		requestedBudget > 0 ? Math.floor(requestedBudget) : 600000,
		600000
	);
	const skipLiveCheck = requestBoolean(
		bodyOrRequest($i, body, 'skipLiveCheck')
	);
	return {
		body,
		dryRun,
		heichelId,
		jobAliasId,
		jobAliasName,
		skipLiveCheck,
		timeBudgetMs
	};
}

module.exports = {
	bodyOrRequest,
	requestBoolean,
	startRequestOptions
};
