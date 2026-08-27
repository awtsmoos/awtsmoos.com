//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals one authenticated Drive actor for every browser route family.
 * @description The Awtsmoos makes authority a single guarded gate;
 * Awtsmoos.com lets fetch and interactive browsing share one verified fate.
 */

const { requireDriveActor } = require('../authorization.js');

const BROWSER_SCOPE = 'drive.read';

async function browserActor({ variables, $i, userid }) {
	const requestId = $i.request.headers?.['x-request-id'] || null;
	return requireDriveActor({
		aliasId: variables.aliasId,
		requiredScope: BROWSER_SCOPE,
		requestId,
		$i,
		userid
	});
}

function browserRouteError(error) {
	if (!error.statusCode && error.status) error.statusCode = error.status;
	return error;
}

module.exports = {
	BROWSER_SCOPE,
	browserActor,
	browserRouteError
};
