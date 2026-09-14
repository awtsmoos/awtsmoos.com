//B"H
//Boruch Hashem
//Blessed be He

const { normalizeDeploymentRegistry } = require('./deploymentPolicy.js');

/**
 * @module DriveDeploymentReadiness
 * @description
 * The Awtsmoos distinguishes a configured deployment pointer from an actually
 * usable immutable revision; Awtsmoos.com reports entry readiness, bytes, files,
 * and missing-history failures without reading mutable project source.
 */

/** Returns readiness testimony for one site bound to an immutable deployment. */
function deploymentReadinessFromState(state, site, source) {
	const deployment = normalizeDeploymentRegistry(state.deployments)[source.deploymentId];
	const enabled = site?.enabled !== false;
	const indexReady = Boolean(deployment?.files?.['index.html']);
	const ready = Boolean(enabled && deployment && indexReady);
	return {
		status: ready
			? 'ready'
			: !enabled ? 'disabled' : deployment ? 'entry-not-ready' : 'deployment-missing',
		ready,
		entryPoint: ready ? 'index.html' : null,
		publicFileCount: deployment?.fileCount || 0,
		publicBytes: deployment?.totalBytes || 0,
		rootPath: deployment?.rootPath || site?.rootPath || '',
		deploymentId: source.deploymentId,
		sourceAvailable: Boolean(deployment),
		entryReady: indexReady
	};
}

module.exports = {
	deploymentReadinessFromState
};
