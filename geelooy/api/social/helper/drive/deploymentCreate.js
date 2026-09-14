//B"H
//Boruch Hashem
//Blessed be He

const {
	deploymentError,
	normalizeDeploymentRecord,
	normalizeDeploymentRegistry
} = require('./deploymentPolicy.js');
const {
	assertExpectedDeployment,
	normalizeExpectedDeploymentId
} = require('./deploymentConcurrency.js');
const {
	deploymentReplay,
	deploymentReplayResult,
	rememberDeploymentReplay
} = require('./deploymentIdempotency.js');
const { normalizeDrivePath } = require('./pathPolicy.js');
const {
	activateSite,
	captureFiles,
	deploymentEvent,
	deploymentId,
	deploymentSummary,
	pruneDeployments
} = require('./deploymentServiceSupport.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { scheduleSiteDeploymentDiscovery } = require('./siteDiscoverySchedule.js');

/**
 * @module DriveDeploymentCreate
 * @description
 * The Awtsmoos joins exact retry identity with optimistic production testimony;
 * Awtsmoos.com creates a fresh immutable revision only when the caller's observed
 * production revision still matches the site inside the serialized alias mutation.
 */

/**
 * Creates and activates one immutable static deployment.
 * @param {object} options - Alias, site, source, retry, actor, and precondition testimony.
 * @returns {Promise<object>} Deployment summary, active site, audit event, and replay flag.
 */
async function createDeployment(options) {
	const expectedDeploymentId = normalizeExpectedDeploymentId(options.expectedDeploymentId);
	const result = await mutateDriveState(options.aliasId, options.$i, state => {
		const siteId = normalizeSiteId(options.siteId);
		const site = state.sites?.[siteId];
		if (!site) {
			throw deploymentError('SITE_NOT_FOUND', 404);
		}
		const rootPath = normalizeDrivePath(
			options.rootPath ?? site.rootPath ?? '',
			{ allowRoot: true }
		);
		const files = captureFiles(state, rootPath);
		if (!files['index.html']) {
			throw deploymentError('DEPLOYMENT_ENTRY_MISSING', 409);
		}
		const replay = deploymentReplay(state, {
			...options,
			environment: 'production',
			expectedDeploymentId
		}, {
			siteId,
			rootPath,
			files
		});
		if (replay.deployment) {
			return deploymentReplayResult(state, replay, siteId);
		}
		assertExpectedDeployment(site, expectedDeploymentId);
		const deployment = normalizeDeploymentRecord(deploymentId(), {
			environment: 'production',
			siteId,
			projectId: options.projectId || '',
			rootPath,
			message: options.message,
			createdAt: new Date().toISOString(),
			createdBy: options.actorUserId,
			requestId: options.requestId,
			files
		});
		state.deployments = normalizeDeploymentRegistry(state.deployments);
		state.deployments[deployment.id] = deployment;
		rememberDeploymentReplay(state, replay, deployment);
		state.sites[siteId] = activateSite(siteId, site, deployment.id);
		pruneDeployments(state, siteId, 'production');
		const event = deploymentEvent(
			state,
			options,
			deployment,
			'deployment.create'
		);
		return {
			deployment: deploymentSummary(deployment),
			site: state.sites[siteId],
			event,
			replayed: false
		};
	});
	scheduleSiteDeploymentDiscovery({
		aliasId: options.aliasId,
		siteId: result.site?.id || result.deployment?.siteId,
		deploymentId: result.deployment?.id,
		$i: options.$i
	});
	return result;
}

module.exports = {
	createDeployment
};
