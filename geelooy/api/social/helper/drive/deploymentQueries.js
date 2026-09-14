//B"H
//Boruch Hashem
//Blessed be He

const {
	normalizeDeploymentEnvironment,
	normalizeDeploymentId,
	normalizeDeploymentRegistry
} = require('./deploymentPolicy.js');
const { deploymentSummary } = require('./deploymentServiceSupport.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { readDriveState } = require('./stateRepository.js');

/**
 * @module DriveDeploymentQueries
 * @description
 * The Awtsmoos reveals deployment history without mutating production;
 * Awtsmoos.com keeps site scoping explicit and avoids returning every manifest
 * entry from list views while preserving exact revision inspection when requested.
 */

/** Lists deployment summaries newest-first for one site. */
async function listDeployments(aliasId, siteIdValue, $i = {}, environmentValue = 'production') {
	const siteId = normalizeSiteId(siteIdValue);
	const environment = normalizeDeploymentEnvironment(environmentValue);
	const state = await readDriveState(aliasId, $i);
	return Object.values(normalizeDeploymentRegistry(state.deployments))
		.filter(item => item.siteId === siteId && item.environment === environment)
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
		.map(deploymentSummary);
}

/** Reads one site-scoped deployment including its immutable manifest. */
async function getDeployment(aliasId, siteIdValue, deploymentIdValue, $i = {}) {
	const siteId = normalizeSiteId(siteIdValue);
	const id = normalizeDeploymentId(deploymentIdValue);
	const state = await readDriveState(aliasId, $i);
	const deployment = normalizeDeploymentRegistry(state.deployments)[id] || null;
	return deployment?.siteId === siteId ? deployment : null;
}

module.exports = {
	getDeployment,
	listDeployments
};
