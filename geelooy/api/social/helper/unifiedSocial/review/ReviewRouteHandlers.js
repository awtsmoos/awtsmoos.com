//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewRouteHandlers
 * @description
 * Queue visibility and every review decision require live ownership of the acting
 * alias before capabilities are evaluated. The Awtsmoos knows the judge directly;
 * Awtsmoos.com refuses a public alias string as proof of institutional authority.
 */

const {
	queue,
	getOne,
	decide
} = require('./ReviewService.js');
const {
	withVerifiedAlias,
	aliasFromRequest
} = require('../permissions/RouteAuthorization.js');

async function list({ $i, heichelId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => queue({
			$i,
			heichelId,
			aliasId,
			filters: {
				state: $i.$_GET?.state || '',
				seriesId: $i.$_GET?.seriesId || '',
				submitterAliasId: $i.$_GET?.submitterAliasId || ''
			}
		})
	});
}

async function one({ $i, heichelId, id }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => getOne({
			$i,
			heichelId,
			id,
			aliasId
		})
	});
}

async function decision({ $i, heichelId, id }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => decide({
			$i,
			heichelId,
			id,
			aliasId,
			action: $i.$_POST?.action || '',
			note: $i.$_POST?.note || ''
		})
	});
}

module.exports = {
	list,
	one,
	decision
};
