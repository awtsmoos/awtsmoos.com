// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelRoutes
 * @description
 * The Awtsmoos lets every social surface ask one read-language without one dangerous mutation doorway;
 * Awtsmoos.com exposes bounded entity truth, capabilities, relations, normalized activity, and action previews today.
 */
const { er } = require('./helper/general.js');
const { normalizeActivityEvent } = require('./helper/socialKernel/activity/SocialActivityNormalizer.js');
const { socialKernelBatch, MAX_KERNEL_TARGETS } = require('./helper/socialKernel/SocialKernelBatch.js');
const { socialKernelEntity } = require('./helper/socialKernel/SocialKernel.js');
const {
	methodOnly,
	ok,
	parseTargets,
	targetFrom,
	truthyFlag,
	viewerAlias
} = require('./helper/socialKernel/routes/SocialKernelRouteTools.js');

function missingEntity() {
	return er({ code: 'ENTITY_NOT_FOUND', message: 'Social entity not found.' });
}

module.exports = ({ $i, userid } = {}) => ({
	'/entity': async () => {
		const bad = methodOnly($i, 'GET');
		if (bad) return bad;
		const result = await socialKernelEntity({
			$i,
			input: targetFrom($i.$_GET || {}),
			viewerAliasId: await viewerAlias({ $i, userid }),
			includeRelations: truthyFlag($i.$_GET?.relations)
		});
		return result ? ok(result) : missingEntity();
	},
	'/entities/batch': async () => {
		const bad = methodOnly($i, 'POST');
		if (bad) return bad;
		const targets = parseTargets($i);
		if (!targets.length) return er({ code: 'BAD_TARGETS', message: 'Provide targets.' });
		const data = await socialKernelBatch({
			$i,
			targets,
			viewerAliasId: await viewerAlias({ $i, userid }),
			includeRelations: truthyFlag($i.$_POST?.includeRelations)
		});
		return ok(data, {
			requested: targets.length,
			returned: data.length,
			maxTargets: MAX_KERNEL_TARGETS
		});
	},
	'/entity/capabilities': async () => {
		const bad = methodOnly($i, 'GET');
		if (bad) return bad;
		const result = await socialKernelEntity({
			$i,
			input: targetFrom($i.$_GET || {}),
			viewerAliasId: await viewerAlias({ $i, userid })
		});
		return result ? ok(result.capabilities) : missingEntity();
	},
	'/entity/relations': async () => {
		const bad = methodOnly($i, 'GET');
		if (bad) return bad;
		const result = await socialKernelEntity({
			$i,
			input: targetFrom($i.$_GET || {}),
			viewerAliasId: await viewerAlias({ $i, userid }),
			includeRelations: true
		});
		return result ? ok(result.relations) : missingEntity();
	},
	'/entity/activity/normalize': async () => {
		const bad = methodOnly($i, 'POST');
		return bad || ok(normalizeActivityEvent($i.$_POST?.activity || $i.$_POST || {}));
	},
	'/entity/action/preview': async () => {
		const bad = methodOnly($i, 'POST');
		if (bad) return bad;
		const result = await socialKernelEntity({
			$i,
			input: targetFrom($i.$_POST || {}),
			viewerAliasId: await viewerAlias({ $i, userid })
		});
		const action = result?.actions?.find(item => item.id === $i.$_POST?.actionId);
		return action
			? ok(action)
			: er({ code: 'ACTION_NOT_FOUND', message: 'Action is not described for this entity.' });
	}
});
