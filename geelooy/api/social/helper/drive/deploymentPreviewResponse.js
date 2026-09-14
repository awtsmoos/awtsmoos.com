//B"H
//Boruch Hashem
//Blessed be He

const { selectDeploymentEntry } = require('./deploymentEntrySelection.js');
const {
	deploymentError,
	normalizeDeploymentId,
	normalizeDeploymentRegistry
} = require('./deploymentPolicy.js');
const { buildPublicEntryResponse } = require('./publicResponse.js');
const { notFoundResponse } = require('./publicResponseHeaders.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { readDriveState } = require('./stateRepository.js');

/**
 * @module DriveDeploymentPreviewResponse
 * @description
 * The Awtsmoos lets an authenticated creator inspect the exact immutable preview
 * bytes through the canonical object reader; Awtsmoos.com preserves HTTP range,
 * ETag, HEAD, directory, and 404 behavior while forbidding shared-cache exposure.
 */

/**
 * Serves one authenticated preview request from an immutable deployment manifest.
 * @param {object} options - Alias, site, deployment, request path, headers, and $i.
 * @returns {Promise<object>} HTTP-shaped private preview response.
 */
async function buildPreviewDeploymentResponse(options) {
	const deployment = await previewDeployment(options);
	const selected = selectDeploymentEntry(deployment, options.path || '');
	if (selected.entry) {
		const result = await entryResponse(options, selected.entry);
		if (selected.directoryIndex && !hasTrailingSlash(options.url)) {
			return redirectResponse(options.url);
		}
		return privateResponse(result, deployment.id);
	}
	return fallbackResponse(options, deployment);
}
/** Reads and proves the requested preview belongs to the requested site. */
async function previewDeployment(options) {
	const siteId = normalizeSiteId(options.siteId);
	const deploymentId = normalizeDeploymentId(options.deploymentId);
	const state = await readDriveState(options.aliasId, options.$i);
	const deployment = normalizeDeploymentRegistry(state.deployments)[deploymentId];
	if (!deployment || deployment.siteId !== siteId || deployment.environment !== 'preview') {
		throw deploymentError('PREVIEW_NOT_FOUND', 404);
	}
	return deployment;
}

/** Reads one immutable object through the canonical metered Drive response. */
function entryResponse(options, entry) {
	return buildPublicEntryResponse({
		aliasId: options.aliasId,
		entry,
		method: options.method,
		headers: options.headers || {},
		$i: options.$i
	});
}

/** Serves a deployment-specific custom 404 without shared-cache semantics. */
async function fallbackResponse(options, deployment) {
	const entry = deployment.files['404.html'];
	if (!entry) {
		return privateResponse(notFoundResponse(), deployment.id);
	}
	const result = await entryResponse(options, entry);
	return privateResponse({ ...result, statusCode: 404 }, deployment.id);
}
/** Removes public-CORS/cache headers from an authenticated preview response. */
function privateResponse(result, deploymentId) {
	const headers = { ...(result.headers || {}) };
	delete headers['Access-Control-Allow-Origin'];
	delete headers['Access-Control-Expose-Headers'];
	headers['Cache-Control'] = 'private, no-store';
	headers['Referrer-Policy'] = 'no-referrer';
	headers['Vary'] = 'Cookie, Authorization, Accept-Encoding';
	headers['X-Awtsmoos-Preview-Deployment'] = deploymentId;
	return { ...result, headers };
}

/** Redirects a directory index request to its trailing-slash identity. */
function redirectResponse(url) {
	const path = String(url || '').split('?')[0].split('#')[0];
	return {
		statusCode: 308,
		headers: {
			Location: `${path}/`,
			'Cache-Control': 'private, no-store'
		},
		response: Buffer.alloc(0)
	};
}

/** Returns true when the request URL already preserves directory semantics. */
function hasTrailingSlash(url) {
	return String(url || '').split('?')[0].split('#')[0].endsWith('/');
}

module.exports = {
	buildPreviewDeploymentResponse
};
