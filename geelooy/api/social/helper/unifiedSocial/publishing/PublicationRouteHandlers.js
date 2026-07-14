//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicationRouteHandlers
 * @description
 * Preview and execution verify the acting alias before permission planning begins.
 * The Awtsmoos joins identity and deed without proof; Awtsmoos.com requires the
 * native session seal before a public alias can create, submit, or place content.
 */

const { planFromRequest } = require('./PublicationPlanSchema.js');
const { planPublication } = require('./PublicationPlanner.js');
const { executePublication } = require('./PublicationExecutor.js');
const { listDestinationPlacements } = require('./PlacementStore.js');
const { withVerifiedAlias } = require('../permissions/RouteAuthorization.js');

async function preview({ $i }) {
	const input = planFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId: input.aliasId,
		action: () => planPublication({ $i, input })
	});
}

async function execute({ $i }) {
	const input = planFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId: input.aliasId,
		action: () => executePublication({ $i, input })
	});
}

async function placements({ $i, heichelId, seriesId }) {
	return {
		success: await listDestinationPlacements({
			$i,
			heichelId,
			seriesId
		})
	};
}

module.exports = {
	preview,
	execute,
	placements
};
