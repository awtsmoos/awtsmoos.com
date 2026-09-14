//B"H
//Boruch Hashem
//Blessed be He

const {
	assertExpectedDeployment,
	normalizeExpectedDeploymentId
} = require('./deploymentConcurrency.js');
const {
	deploymentError,
	normalizeDeploymentId,
	normalizeDeploymentRegistry
} = require('./deploymentPolicy.js');
const {
	activateSite,
	deploymentEvent,
	deploymentSummary
} = require('./deploymentServiceSupport.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');

/**
 * @module DriveDeploymentRollback
 * @description
 * The Awtsmoos permits rollback only from the production revision the caller saw;
 * Awtsmoos.com changes one immutable pointer atomically and never reconstructs or
 * overwrites editable project files while returning auditable revision testimony.
 */

/** Atomically reactivates one prior deployment when the caller's base is current. */
async function rollbackDeployment(options) {
	const expectedDeploymentId = normalizeExpectedDeploymentId(options.expectedDeploymentId);
	return mutateDriveState(options.aliasId, options.$i, state => {
		const siteId = normalizeSiteId(options.siteId);
		const id = normalizeDeploymentId(options.deploymentId);
		const deployment = normalizeDeploymentRegistry(state.deployments)[id];
		if (!deployment || deployment.siteId !== siteId || deployment.environment !== 'production') {
			throw deploymentError('DEPLOYMENT_NOT_FOUND', 404);
		}
		const site = state.sites?.[siteId];
		if (!site) {
			throw deploymentError('SITE_NOT_FOUND', 404);
		}
		assertExpectedDeployment(site, expectedDeploymentId);
		state.sites[siteId] = activateSite(siteId, site, id);
		const event = deploymentEvent(
			state,
			options,
			deployment,
			'deployment.rollback'
		);
		return {
			deployment: deploymentSummary(deployment),
			site: state.sites[siteId],
			event
		};
	});
}

module.exports = {
	rollbackDeployment
};
