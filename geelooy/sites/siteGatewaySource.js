//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteGatewaySource
 * @description
 * The Awtsmoos gives one public Site identity several source vessels while Awtsmoos.com keeps transport choice behind one narrow gate;
 * Drive roots reveal their resolved index light even when migration left no folder marker, while every ordinary file keeps its exact road.
 */

const { SOURCE_KINDS } = require('../api/social/helper/drive/siteSourcePolicy.js');
const { buildDeploymentResponse } = require('./deploymentSiteResponse.js');
const { buildHostedProjectResponse } = require('./hostedProjectProxy.js');
const { mappedNotFound, publicSiteResponse } = require('./siteGatewayResponses.js');
const { buildVirtualOsResponse } = require('./virtualOsSiteResponse.js');
const { resolveSiteSource } = require('./siteSourceResolution.js');

/**
 * Routes one resolved Site request into its bounded source transport.
 * @param {object} options Gateway request vessel.
 * @param {object} resolution Canonical Site resolution.
 * @param {string} method HTTP method.
 * @param {object} state Current Drive state.
 * @returns {Promise<object>} Mapped source response testimony.
 */
async function buildMappedSourceResponse(options, resolution, method, state) {
	const source = resolveSiteSource(resolution.site, resolution.relativePath);
	if (source.kind === SOURCE_KINDS.HOSTED_PROJECT) {
		return hostedSourceResponse(options, resolution, method, source);
	}
	if (source.kind === SOURCE_KINDS.VIRTUAL_OS) {
		const direct = await buildVirtualOsResponse(options, source, method);
		return { ...direct, source };
	}
	if (source.kind === SOURCE_KINDS.DRIVE_DEPLOYMENT) {
		const deployed = await buildDeploymentResponse(options, source, method, state);
		return { ...deployed, source };
	}
	return driveSourceResponse(options, resolution, method, state, source);
}

async function hostedSourceResponse(options, resolution, method, source) {
	return {
		result: await buildHostedProjectResponse({
			aliasId: options.aliasId,
			siteId: resolution.site.id,
			method,
			headers: options.headers,
			request: options.request,
			url: options.url
		}, source),
		directoryIndex: false,
		source
	};
}

/**
 * Serves Drive-backed Sites from the exact resolved public artifact.
 * Root or folder requests use `entryDrivePath`, preventing migrated Sites without synthetic folder entries from false 404s.
 */
async function driveSourceResponse(options, resolution, method, state, source) {
	const requestedEntry = state.entries?.[source.drivePath];
	const directoryIndex = isDirectoryRequest(source, requestedEntry);
	const publicPath = drivePublicPath(source, requestedEntry);
	let result = await publicSiteResponse(options, publicPath, method);
	if (result.statusCode === 404 && resolution.fallbackPath) {
		result = await mappedNotFound(options, method, result, resolution.fallbackPath);
	}
	return {
		result,
		directoryIndex: directoryIndex && result.statusCode === 200,
		source,
		state
	};
}

/** @returns {boolean} Whether this Drive request names a directory-like public route. */
function isDirectoryRequest(source, requestedEntry) {
	return source.relativePath === '' || requestedEntry?.type === 'folder';
}

/**
 * Chooses the precise Drive artifact the public responder must read.
 * @returns {string} Index artifact for directory routes; exact path otherwise.
 */
function drivePublicPath(source, requestedEntry) {
	return isDirectoryRequest(source, requestedEntry)
		? source.entryDrivePath
		: source.drivePath;
}

module.exports = {
	buildMappedSourceResponse,
	drivePublicPath,
	isDirectoryRequest
};
