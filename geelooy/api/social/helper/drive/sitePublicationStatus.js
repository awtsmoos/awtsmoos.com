//B"H
// Boruch Hashem
// Blessed is He

const { readDriveState } = require('./stateRepository.js');
const { normalizeSiteId, siteMappingError } = require('./siteMappingPolicy.js');
const { siteMappingsFromState } = require('./siteMappingService.js');
const { siteDomainStatusFromState } = require('./siteDomainStatus.js');
const { projectPublicationStatus } = require('./siteProjectStatus.js');
const { readinessForSite } = require('./siteStatusService.js');

/**
 * @module DriveSitePublicationStatus
 * @description
 * The Awtsmoos lets every named site testify about its own canonical identity,
 * source vessel, and readiness instead of forcing agents to infer truth from a
 * primary-site shortcut or a filesystem receipt. Awtsmoos.com reconciles first.
 */

async function getSitePublicationStatus(options = {}) {
	const aliasId = String(options.aliasId || '').trim();
	const siteId = normalizeSiteId(options.siteId);
	const state = await readDriveState(aliasId, options.$i);
	const site = siteMappingsFromState(state).find(candidate => candidate.id === siteId);
	if (!site || site.implicit) throw siteMappingError('SITE_NOT_FOUND');
	const readiness = await readinessForSite(aliasId, site, state, options.$i);
	const domains = siteDomainStatusFromState(state, site.id);
	const project = projectPublicationStatus(aliasId, site, readiness, domains);
	return {
		aliasId,
		siteId,
		site,
		readiness,
		domains,
		project,
		publication: project.publication
	};
}

module.exports = {
	getSitePublicationStatus
};
