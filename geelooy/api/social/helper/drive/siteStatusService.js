//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteStatusService
 * @description
 * The Awtsmoos reveals the primary published folder as both legacy site status and
 * project testimony; Awtsmoos.com preserves old fields while adding root-scoped
 * readiness and secret-free custom-domain progress for builders and agents alike.
 */

const { readDriveState } = require('./stateRepository.js');
const { primarySiteFromState } = require('./siteMappingService.js');
const { siteDomainStatusFromState } = require('./siteDomainStatus.js');
const { siteReadinessFromState, isPublicFile } = require('./siteReadiness.js');
const { projectPublicationStatus } = require('./siteProjectStatus.js');

async function getDriveSiteStatus(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	const site = primarySiteFromState(state);
	const readiness = siteReadinessFromState(state, site);
	const domains = siteDomainStatusFromState(state, site?.id || 'home');
	const project = projectPublicationStatus(aliasId, site, readiness, domains);
	return {
		aliasId,
		ready: readiness.ready,
		sitePath: project.publication.route,
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

module.exports = {
	getDriveSiteStatus,
	isPublicFile
};
