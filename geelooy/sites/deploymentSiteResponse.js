//B"H
//Boruch Hashem
//Blessed be He

const { normalizeDeploymentRegistry } = require('../api/social/helper/drive/deploymentPolicy.js');
const { selectDeploymentEntry } = require('../api/social/helper/drive/deploymentEntrySelection.js');
const { buildPublicEntryResponse } = require('../api/social/helper/drive/publicResponse.js');
const { notFoundResponse } = require('../api/social/helper/drive/publicResponseHeaders.js');

/**
 * @module DeploymentSiteResponse
 * @description
 * The Awtsmoos keeps a production revision fixed while editable source continues;
 * Awtsmoos.com resolves public requests against the deployment's immutable hash
 * manifest and preserves normal Drive range, ETag, cache, MIME, and usage behavior.
 */

/** Serves one GET/HEAD request from an immutable Drive deployment manifest. */
async function buildDeploymentResponse(options, source, method, state) {
	const deployments = normalizeDeploymentRegistry(state.deployments);
	const deployment = deployments[source.deploymentId];
	if (!deployment) {
		return {
			result: notFoundResponse(),
			directoryIndex: false
		};
	}
	const selected = selectDeploymentEntry(deployment, source.relativePath);
	if (selected.entry) {
		return {
			result: await entryResponse(options, selected.entry, method),
			directoryIndex: selected.directoryIndex
		};
	}
	return fallbackResponse(options, deployment, method);
}

async function fallbackResponse(options, deployment, method) {
	const entry = deployment.files['404.html'];
	if (!entry) {
		return { result: notFoundResponse(), directoryIndex: false };
	}
	const result = await entryResponse(options, entry, method);
	return {
		result: {
			...result,
			statusCode: 404,
			headers: {
				...result.headers,
				'Cache-Control': 'no-cache, must-revalidate'
			}
		},
		directoryIndex: false
	};
}

function entryResponse(options, entry, method) {
	return buildPublicEntryResponse({
		aliasId: options.aliasId,
		entry,
		method,
		headers: options.headers || {},
		$i: options.$i
	});
}

module.exports = {
	buildDeploymentResponse
};
