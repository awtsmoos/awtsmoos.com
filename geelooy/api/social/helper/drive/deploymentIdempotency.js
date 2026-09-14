//B"H
//Boruch Hashem
//Blessed be He

const crypto = require('crypto');
const { deploymentError } = require('./deploymentPolicy.js');
const { idempotencyKey } = require('./streamingHeaderBasics.js');
const { deploymentSummary } = require('./deploymentServiceSupport.js');

/**
 * @module DriveDeploymentIdempotency
 * @description
 * The Awtsmoos binds one external retry identity to one exact source-manifest intent;
 * Awtsmoos.com replays acknowledged publication without duplicating revisions while
 * changed bytes, paths, site, root, or metadata turn accidental key reuse into conflict.
 */

const KINDS = Object.freeze({
	production: 'deployment.publish',
	preview: 'deployment.preview'
});
const MAX_RECORDS = 500;

/** Returns an existing deployment for an identical publish retry, otherwise null. */
function deploymentReplay(state, options, intent) {
	const kind = operationKind(options.environment);
	const key = recordKey(options.idempotencyKey);
	const fingerprint = publishFingerprint(options, intent);
	const previous = state.idempotencyRecords?.[key];
	if (!previous) return { key, fingerprint, kind, deployment: null };
	if (previous.kind !== kind || previous.fingerprint !== fingerprint) {
		throw deploymentError('IDEMPOTENCY_CONFLICT', 409);
	}
	const deployment = state.deployments?.[previous.deploymentId];
	if (!deployment || deployment.siteId !== intent.siteId) {
		throw deploymentError('IDEMPOTENCY_RECORD_STALE', 409);
	}
	return { key, fingerprint, kind, deployment };
}

/** Builds a mutation-free replay response without reactivating an old revision. */
function deploymentReplayResult(state, replay, siteId) {
	return {
		deployment: deploymentSummary(replay.deployment),
		site: state.sites[siteId],
		event: null,
		replayed: true
	};
}

/** Remembers one successful deployment publication for deterministic retry. */
function rememberDeploymentReplay(state, replay, deployment) {
	state.idempotencyRecords ||= {};
	state.idempotencyRecords[replay.key] = {
		kind: replay.kind,
		fingerprint: replay.fingerprint,
		deploymentId: deployment.id,
		siteId: deployment.siteId,
		createdAt: deployment.createdAt
	};
	pruneRecords(state);
}

function publishFingerprint(options, intent) {
	const files = Object.entries(intent.files || {})
		.sort((left, right) => left[0].localeCompare(right[0]))
		.map(([path, file]) => [path, file.objectHash, file.size]);
	const canonical = JSON.stringify({
		siteId: intent.siteId,
		projectId: String(options.projectId || ''),
		rootPath: intent.rootPath,
		message: String(options.message || ''),
		environment: options.environment || 'production',
		expectedDeploymentId: options.expectedDeploymentId,
		files
	});
	return crypto.createHash('sha256').update(canonical).digest('hex');
}

function operationKind(environment) {
	return KINDS[environment] || KINDS.production;
}

function recordKey(value) {
	const key = idempotencyKey(value);
	const hash = crypto.createHash('sha256').update(key).digest('hex');
	return `deployment:${hash}`;
}

function pruneRecords(state) {
	const records = Object.entries(state.idempotencyRecords || {})
		.filter(([, value]) => Object.values(KINDS).includes(value.kind))
		.sort((left, right) => String(left[1].createdAt).localeCompare(String(right[1].createdAt)));
	for (const [key] of records.slice(0, Math.max(0, records.length - MAX_RECORDS))) {
		delete state.idempotencyRecords[key];
	}
}

module.exports = {
	deploymentReplay,
	deploymentReplayResult,
	rememberDeploymentReplay
};
