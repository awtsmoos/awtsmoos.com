//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteStatusService
 * @description
 * The Awtsmoos reveals one canonical site's truth without forcing every source
 * into Drive. Awtsmoos.com preserves legacy readiness for snapshots and reads
 * living hosted folders directly when a mapping names Virtual OS as its source.
 */

const { readDriveState } = require('./stateRepository.js');
const { primarySiteFromState } = require('./siteMappingService.js');
const { siteDomainStatusFromState } = require('./siteDomainStatus.js');
const { siteReadinessFromState, isPublicFile } = require('./siteReadiness.js');
const { projectPublicationStatus } = require('./siteProjectStatus.js');
const { SOURCE_KINDS, effectiveSiteSource } = require('./siteSourcePolicy.js');
const { directSiteReadiness } = require('../../../../sites/directSiteReadiness.js');

async function getDriveSiteStatus(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	const site = primarySiteFromState(state);
	const readiness = await readinessForSite(aliasId, site, state, $i);
	const domains = siteDomainStatusFromState(state, site?.id || 'home');
	const project = projectPublicationStatus(aliasId, site, readiness, domains);
	return {
		aliasId,
		ready: readiness.ready,
		sitePath: project.publication.route,
		canonicalUrl: project.publication.canonicalUrl,
		entryPoint: readiness.entryPoint,
		publicFileCount: readiness.publicFileCount,
		publicBytes: readiness.publicBytes,
		relativeLinksSupported: true,
		rootRelativeLinksSupported: false,
		site,
		readiness,
		project
	};
}

async function readinessForSite(aliasId, site, state, $i) {
	const source = effectiveSiteSource(site || {});
	if (source.kind !== SOURCE_KINDS.VIRTUAL_OS) {
		return siteReadinessFromState(state, site);
	}
	const direct = await directSiteReadiness($i, aliasId, source.rootPath);
	return directReadiness(source.rootPath, direct);
}

function directReadiness(rootPath, direct) {
	const ready = Boolean(direct.sourceAvailable && direct.entryReady);
	return {
		ready,
		status: ready
			? 'ready'
			: direct.sourceAvailable ? 'entry-not-ready' : 'source-unavailable',
		rootPath,
		entryPoint: [rootPath, 'index.html'].filter(Boolean).join('/'),
		publicFileCount: null,
		publicBytes: null,
		sourceAvailable: direct.sourceAvailable,
		entryReady: direct.entryReady
	};
}

module.exports = {
	directReadiness,
	getDriveSiteStatus,
	isPublicFile,
	readinessForSite
};
