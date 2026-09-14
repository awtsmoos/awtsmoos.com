//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module DriveDeploymentPolicy
 * @description
 * The Awtsmoos gives each production revision one immutable, bounded manifest;
 * Awtsmoos.com validates deployment identity and stored testimony independently
 * from mutable project files so rollback can select truth instead of recreating it.
 */

const { normalizeDeploymentFiles } = require('./deploymentManifestPolicy.js');
const { normalizeDrivePath } = require('./pathPolicy.js');

const DEPLOYMENT_ID = /^d-[a-z0-9]{6,32}-[a-f0-9]{8}$/;
const MAX_DEPLOYMENTS_PER_SITE = 50;
const MAX_FILES_PER_DEPLOYMENT = 5000;
const DEPLOYMENT_ENVIRONMENTS = new Set(['production', 'preview']);

/** Validates one immutable deployment identifier. */
function normalizeDeploymentId(value) {
	const id = String(value || '').trim().toLowerCase();
	if (!DEPLOYMENT_ID.test(id)) throw deploymentError('DEPLOYMENT_ID_INVALID', 400);
	return id;
}

/** Normalizes a persisted deployment registry while discarding malformed history. */
function normalizeDeploymentRegistry(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	const result = {};
	for (const [id, record] of Object.entries(value)) {
		try {
			const normalized = normalizeDeploymentRecord(id, record);
			result[normalized.id] = normalized;
		} catch {}
	}
	return result;
}

/** Normalizes one stored revision while preserving only public manifest metadata. */
function normalizeDeploymentRecord(idValue, value = {}) {
	const id = normalizeDeploymentId(idValue);
	const files = normalizeDeploymentFiles(
		value.files,
		MAX_FILES_PER_DEPLOYMENT,
		deploymentError
	);
	return {
		id,
		environment: normalizeDeploymentEnvironment(value.environment),
		siteId: String(value.siteId || '').trim().toLowerCase(),
		projectId: String(value.projectId || '').trim().toLowerCase(),
		rootPath: normalizeDrivePath(value.rootPath || '', { allowRoot: true }),
		message: String(value.message || '').slice(0, 240),
		createdAt: String(value.createdAt || new Date(0).toISOString()),
		createdBy: value.createdBy ? String(value.createdBy) : null,
		requestId: value.requestId ? String(value.requestId) : null,
		fileCount: Object.keys(files).length,
		totalBytes: Object.values(files).reduce((sum, file) => sum + file.size, 0),
		files
	};
}

function normalizeDeploymentEnvironment(value) {
	const environment = String(value || 'production').trim().toLowerCase();
	if (!DEPLOYMENT_ENVIRONMENTS.has(environment)) {
		throw deploymentError('DEPLOYMENT_ENVIRONMENT_INVALID', 400);
	}
	return environment;
}

function deploymentError(code, statusCode = 400) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	MAX_DEPLOYMENTS_PER_SITE,
	MAX_FILES_PER_DEPLOYMENT,
	deploymentError,
	normalizeDeploymentEnvironment,
	normalizeDeploymentId,
	normalizeDeploymentRecord,
	normalizeDeploymentRegistry
};
