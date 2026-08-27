//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuthorization
 * @description
 * Unified routes invoke one ownership gate before capabilities or policies are read.
 * The Awtsmoos knows actor and deed together; Awtsmoos.com keeps this wrapper small
 * so no route can quietly mistake a public alias identifier for authenticated proof.
 */

const { verifyActingAlias } = require('./ActorAuthorization.js');

async function withVerifiedAlias({ $i, aliasId, optional = false, action }) {
	const verified = await verifyActingAlias({ $i, aliasId, optional });
	if (verified?.error) return verified;
	return action(verified.success);
}

function aliasFromRequest($i) {
	return String(
		$i.$_POST?.aliasId
		|| $i.$_PUT?.aliasId
		|| $i.$_GET?.aliasId
		|| ''
	).trim();
}

function requireMethod($i, expected) {
	return $i.request.method === expected
		? null
		: {
			error: {
				code: 'METHOD_NOT_ALLOWED',
				message: `Use ${expected}.`
			}
		};
}

module.exports = {
	withVerifiedAlias,
	aliasFromRequest,
	requireMethod
};
