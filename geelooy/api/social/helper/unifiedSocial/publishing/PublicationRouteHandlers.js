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
const { useridFrom } = require('../permissions/ActorAuthorization.js');

// B"H 2026-11-20 (composer publish cluster, defect 1): a userId must never
// be accepted as a publishing aliasId. Ownership verification alone cannot
// catch the collision case (an account whose userId also exists as an
// alias id passes verifyAliasOwnership), and a stale client identity then
// published under the userId while the composer showed the chosen public
// alias. Reject loudly at the authoring door, before planning begins.
function rejectUserIdAlias({ $i, input }) {
	const userid = useridFrom($i);
	if (userid && String(input?.aliasId || '').trim() === userid) {
		return {
			error: {
				code: 'ALIAS_ID_IS_USER_ID',
				message: 'A user ID cannot publish as an alias. Choose a public alias and publish again.'
			}
		};
	}
	return null;
}

async function preview({ $i }) {
	const input = planFromRequest($i);
	const rejected = rejectUserIdAlias({ $i, input });
	if (rejected) return rejected;
	return withVerifiedAlias({
		$i,
		aliasId: input.aliasId,
		action: () => planPublication({ $i, input })
	});
}

async function execute({ $i }) {
	const input = planFromRequest($i);
	const rejected = rejectUserIdAlias({ $i, input });
	if (rejected) return rejected;
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
