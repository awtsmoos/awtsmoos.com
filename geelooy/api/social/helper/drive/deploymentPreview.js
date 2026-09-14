//B"H
//Boruch Hashem
//Blessed be He

const {
	deploymentError,
	normalizeDeploymentRecord,
	normalizeDeploymentRegistry
} = require('./deploymentPolicy.js');
const {
	deploymentReplay,
	deploymentReplayResult,
	rememberDeploymentReplay
} = require('./deploymentIdempotency.js');
const { normalizeDrivePath } = require('./pathPolicy.js');
const {
	captureFiles,
	deploymentEvent,
	deploymentId,
	deploymentSummary,
	pruneDeployments
} = require('./deploymentServiceSupport.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');

/**
 * @module DriveDeploymentPreview
 * @description
 * The Awtsmoos lets editable source become one immutable server preview without
 * touching production; Awtsmoos.com records exact object hashes, retry identity,
 * actor testimony, and bounded preview history beside the live deployment river.
 */
/**
 * Creates one immutable preview from current public source without activating it.
 * @param {object} options - Alias, site, source, actor, and idempotency testimony.
 * @returns {Promise<object>} Preview summary, unchanged site, event, and replay flag.
 */
async function createPreviewDeployment(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
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
			environment: 'preview'
		}, {
			siteId,
			rootPath,
			files
		});
		if (replay.deployment) {
			return deploymentReplayResult(state, replay, siteId);
		}
		const deployment = normalizeDeploymentRecord(deploymentId(), {
			environment: 'preview',
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
		pruneDeployments(state, siteId, 'preview');
		const event = deploymentEvent(
			state,
			options,
			deployment,
			'deployment.preview.create'
		);
		return {
			deployment: deploymentSummary(deployment),
			site: state.sites[siteId],
			event,
			replayed: false
		};
	});
}

module.exports = {
	createPreviewDeployment
};
