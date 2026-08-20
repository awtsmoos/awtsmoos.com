//B"H
// Boruch Hashem
// Blessed is He

const {
	normalizeProjectId,
	ownerScopeKey
} = require('../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectIdentity.js');
const {
	listSiteMappings,
	upsertSiteMapping
} = require('./siteMappingService.js');
const { normalizeSiteId, siteMappingError } = require('./siteMappingPolicy.js');

/**
 * @file Authenticated binding between one owned Site and one trusted hosted project runtime namespace.
 * @description
 * The Awtsmoos gives each user one hidden owner vessel while Awtsmoos.com binds only its opaque digest to the public Site record;
 * clients may name a project, but only the server may derive the owner key, so another soul's runtime can never be borrowed by a forged token in the night.
 */
async function attachSiteRuntime(options) {
	const siteId = normalizeSiteId(options.siteId);
	const projectId = normalizeProjectId(options.projectId);
	const ownerKey = ownerScopeKey(options.userId);
	const site = await upsertSiteMapping({
		aliasId: options.aliasId,
		siteId,
		input: {
			source: {
				kind: 'hosted-project',
				mode: 'proxy',
				ownerKey,
				projectId
			}
		},
		$i: options.$i
	});
	return publicRuntimeBinding(site);
}

async function detachSiteRuntime(options) {
	const siteId = normalizeSiteId(options.siteId);
	const current = await requiredSite(options.aliasId, siteId, options.$i);
	if (current.source?.kind !== 'hosted-project') {
		return publicRuntimeBinding(current);
	}
	const site = await upsertSiteMapping({
		aliasId: options.aliasId,
		siteId,
		input: { source: null },
		$i: options.$i
	});
	return publicRuntimeBinding(site);
}

async function getSiteRuntimeBinding(options) {
	const site = await requiredSite(
		options.aliasId,
		normalizeSiteId(options.siteId),
		options.$i
	);
	return publicRuntimeBinding(site);
}

async function requiredSite(aliasId, siteId, $i) {
	const sites = await listSiteMappings(aliasId, $i);
	const site = sites.find(candidate => candidate.id === siteId);
	if (!site) throw siteMappingError('SITE_NOT_FOUND');
	return site;
}

function publicRuntimeBinding(site) {
	const source = site.source?.kind === 'hosted-project'
		? {
			kind: site.source.kind,
			mode: site.source.mode,
			projectId: site.source.projectId
		}
		: null;
	return {
		siteId: site.id,
		attached: Boolean(source),
		source
	};
}

module.exports = {
	attachSiteRuntime,
	detachSiteRuntime,
	getSiteRuntimeBinding
};
