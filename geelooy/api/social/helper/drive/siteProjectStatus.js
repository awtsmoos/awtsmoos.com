//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteProjectStatus
 * @description
 * The Awtsmoos gives every explicit site one stable canonical name while a
 * primary site may also wear the shorter alias-root doorway. Awtsmoos.com never
 * lets changing primary status silently rename the website the world depends on.
 */

const { canonicalSiteUrl } = require('./siteCanonicalUrl.js');
const { effectiveSiteSource } = require('./siteSourcePolicy.js');

const EMPTY_DOMAINS = Object.freeze({
	status: 'unattached',
	attachedCount: 0,
	domains: []
});

function projectPublicationStatus(aliasId, site, readiness, domainStatus = EMPTY_DOMAINS) {
	const projectId = site?.id || 'home';
	const staticState = readiness.ready ? 'ready' : readiness.status;
	const canonicalPath = publicRoute(aliasId, site);
	const source = effectiveSiteSource(site || {});
	return {
		version: 3,
		projectId,
		title: site?.title || projectId,
		ownerAlias: aliasId,
		rootPath: readiness.rootPath,
		mode: 'static',
		publication: publicationStatus(
			site,
			readiness,
			source,
			staticState,
			canonicalPath,
			primaryAliasRoute(aliasId, site)
		),
		domains: domainStatus,
		stages: stageStatus(staticState, site, domainStatus.status)
	};
}

function publicationStatus(site, readiness, source, state, canonicalPath, primaryPath) {
	return {
		state,
		route: canonicalPath,
		canonicalPath,
		canonicalUrl: canonicalSiteUrl(canonicalPath),
		primaryAliasPath: primaryPath,
		canonicalVerifiedLive: Boolean(readiness.canonicalVerifiedLive),
		primary: site?.primary !== false,
		enabled: site?.enabled !== false,
		subdomainRequested: Boolean(site?.subdomainRequested),
		entryPoint: readiness.entryPoint,
		publicFileCount: readiness.publicFileCount,
		publicBytes: readiness.publicBytes,
		source,
		sourceAvailable: readiness.sourceAvailable ?? readiness.ready,
		entryReady: readiness.entryReady ?? readiness.ready
	};
}

function publicRoute(aliasId, site) {
	const alias = encodeURIComponent(aliasId);
	if (!site || site.implicit) return `/sites/${alias}/`;
	return `/sites/${alias}/${encodeURIComponent(site.id)}/`;
}

function primaryAliasRoute(aliasId, site) {
	if (!site?.primary || site.implicit) return null;
	return `/sites/${encodeURIComponent(aliasId)}/`;
}

function stageStatus(staticState, site, customDomainState) {
	return {
		build: { files: 'ready', code: 'ready' },
		run: { runtime: 'unattached', database: 'unattached', auth: 'unattached' },
		ship: {
			static: staticState,
			subdomain: site?.subdomainRequested ? 'requested' : 'available',
			customDomain: customDomainState
		},
		connect: { git: 'unattached', tunnel: 'unattached', social: 'unattached' }
	};
}

module.exports = {
	primaryAliasRoute,
	projectPublicationStatus,
	publicRoute
};
