//B"H
//Boruch Hashem
//Blessed be He

const crypto = require('crypto');
const { recordDriveEvent } = require('./auditEvents.js');
const { MAX_DEPLOYMENTS_PER_SITE } = require('./deploymentPolicy.js');
const { normalizeSiteRecord } = require('./siteMappingPolicy.js');

/**
 * @module DriveDeploymentServiceSupport
 * @description
 * The Awtsmoos measures manifest capture, activation, retention, and testimony;
 * Awtsmoos.com keeps these mechanics outside the deployment service so its public
 * create/list/get/rollback covenant remains spacious, auditable, and uncompressed.
 */

/** Creates a collision-resistant revision identity without exposing object hashes. */
function deploymentId() {
	return `d-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

/** Captures only active public files beneath one editable Drive project root. */
function captureFiles(state, rootPath) {
	const files = {};
	for (const [path, entry] of Object.entries(state.entries || {})) {
		if (!publicFile(entry) || !insideRoot(path, rootPath)) continue;
		const relative = rootPath ? path.slice(rootPath.length + 1) : path;
		if (relative) files[relative] = entry;
	}
	return files;
}

/** Returns a site record pointing at one immutable Drive deployment. */
function activateSite(siteId, site, deploymentIdValue) {
	return normalizeSiteRecord(siteId, {
		source: {
			kind: 'drive-deployment',
			mode: 'snapshot',
			deploymentId: deploymentIdValue
		}
	}, site);
}

/** Retains a bounded rollback history per site while preserving the newest revisions. */
function pruneDeployments(state, siteId, environment = 'production') {
	const items = Object.values(state.deployments || {})
		.filter(item => item.siteId === siteId && item.environment === environment)
		.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
	while (items.length > MAX_DEPLOYMENTS_PER_SITE) {
		const removed = items.shift();
		delete state.deployments[removed.id];
	}
}

/** Records one secret-free deployment lifecycle event in the Drive audit ledger. */
function deploymentEvent(state, options, deployment, type) {
	return recordDriveEvent(state, {
		type,
		actorUserId: options.actorUserId,
		credentialId: options.credentialId,
		path: deployment.rootPath,
		requestId: options.requestId
	});
}

/** Returns deployment testimony without returning its potentially large manifest. */
function deploymentSummary(value) {
	return {
		id: value.id,
		environment: value.environment,
		siteId: value.siteId,
		projectId: value.projectId,
		rootPath: value.rootPath,
		message: value.message,
		createdAt: value.createdAt,
		createdBy: value.createdBy,
		fileCount: value.fileCount,
		totalBytes: value.totalBytes
	};
}

function publicFile(entry) {
	return entry?.type === 'file'
		&& !entry.trashedAt
		&& entry.visibility === 'public';
}

function insideRoot(path, rootPath) {
	return !rootPath || path === rootPath || path.startsWith(`${rootPath}/`);
}

module.exports = {
	activateSite,
	captureFiles,
	deploymentEvent,
	deploymentId,
	deploymentSummary,
	pruneDeployments
};
