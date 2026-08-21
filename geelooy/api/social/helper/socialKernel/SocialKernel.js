// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernel
 * @description
 * The Awtsmoos is one before entity, summary, relation, capability, action, and path unfold; Awtsmoos.com composes
 * those measured vessels into one kernel response while canonical mutations remain safely in their proven homes.
 */
const { socialActionDescriptors } = require('./actions/SocialActionDescriptor.js');
const { socialCapabilities } = require('./capabilities/SocialCapabilityPolicy.js');
const { socialDeepLink } = require('./deepLinks/SocialDeepLink.js');
const { loadSocialEntity } = require('./entity/SocialEntityLoader.js');
const { isPostLike } = require('./entity/SocialEntityType.js');
const { persistedRelationKinds } = require('./relations/SocialRelationCatalog.js');
const { readSocialRelations } = require('./relations/SocialRelationReader.js');
const { summarizeSocial } = require('../socialSummary/SocialSummary.js');

async function relationSummary({ $i, entity }) {
	const kinds = persistedRelationKinds();
	const pairs = await Promise.all(kinds.map(async kind => {
		const inbound = await readSocialRelations({ $i, entity, kind, direction: 'inbound' });
		const outbound = await readSocialRelations({ $i, entity, kind, direction: 'outbound' });
		return [kind, { inbound, outbound }];
	}));
	return Object.fromEntries(pairs);
}

async function socialKernelEntity({ $i, input, viewerAliasId = '', includeRelations = false }) {
	const entity = await loadSocialEntity({ $i, input });
	if (!entity) return null;
	const deepLink = socialDeepLink(entity);
	const summary = isPostLike(entity.type)
		? await summarizeSocial({ $i, target: entity, viewerAliasId })
		: null;
	const capabilities = await socialCapabilities({ $i, entity, summary, viewerAliasId, deepLink });
	const output = {
		schemaVersion: 1,
		entity,
		summary,
		capabilities,
		actions: socialActionDescriptors(capabilities),
		deepLink,
		viewerState: viewerAliasId ? { aliasId: viewerAliasId } : null,
		generatedAt: Date.now()
	};
	if (includeRelations) output.relations = await relationSummary({ $i, entity });
	return output;
}

module.exports = { relationSummary, socialKernelEntity };
