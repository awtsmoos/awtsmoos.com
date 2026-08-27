// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelProjection
 * @description The Awtsmoos lets measured discovery rows share one request's authority knowledge while each remains distinct;
 * Awtsmoos.com projects entity, summary, capabilities, actions, and deep links without rereading storage or repeating Heichel proof.
 */
const { socialActionDescriptors } = require('./actions/SocialActionDescriptor.js');
const { socialCapabilities } = require('./capabilities/SocialCapabilityPolicy.js');
const { socialDeepLink } = require('./deepLinks/SocialDeepLink.js');
const { normalizeSocialEntity } = require('./entity/SocialEntityNormalizer.js');
const { normalizeSummaryTarget, sourceOf } = require('../socialSummary/SocialSummaryTarget.js');

function discoveryEntity(item = {}) {
	const target = normalizeSummaryTarget(item);
	if (!target) return null;
	const source = sourceOf(item);
	return normalizeSocialEntity({
		...source,
		type: target.type,
		id: target.id,
		heichelId: target.heichelId,
		seriesId: target.seriesId,
		aliasId: source.authorAliasId || source.aliasId || item.aliasId || ''
	});
}

async function projectSocialKernel({
	$i,
	item,
	viewerAliasId = '',
	authorityCache = null
}) {
	const entity = discoveryEntity(item);
	if (!entity) return null;
	const summary = item.socialSummary || null;
	const deepLink = socialDeepLink(entity);
	const capabilities = await socialCapabilities({
		$i,
		entity,
		summary,
		viewerAliasId,
		deepLink,
		authorityCache
	});
	return {
		schemaVersion: 1,
		entity,
		summary,
		capabilities,
		actions: socialActionDescriptors(capabilities),
		deepLink,
		viewerState: viewerAliasId ? { aliasId: viewerAliasId } : null,
		generatedAt: Date.now()
	};
}

async function enrichItemsWithSocialKernel({ $i, items = [], viewerAliasId = '' }) {
	const authorityCache = new Map();
	return Promise.all(items.map(async item => ({
		...item,
		socialKernel: await projectSocialKernel({
			$i,
			item,
			viewerAliasId,
			authorityCache
		})
	})));
}

module.exports = { discoveryEntity, enrichItemsWithSocialKernel, projectSocialKernel };
