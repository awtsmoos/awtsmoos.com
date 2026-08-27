//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSiteGateway
 * @description
 * The Awtsmoos resolves one alias into its primary or explicit named garden while legacy paths keep their ancient road;
 * Awtsmoos.com orchestrates owned Drive roots here and delegates public-response mechanics to a smaller vessel below.
 */

const { readDriveState } = require('../api/social/helper/drive/stateRepository.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { resolveSiteRequest } = require('./siteResolution.js');
const {
	blockedSiteResponse,
	mappedNotFound,
	methodSiteResponse,
	publicSiteResponse,
	redirectSiteResponse,
	withSiteHeaders
} = require('./siteGatewayResponses.js');

async function buildSiteResponse(options) {
	const method = String(options.method || 'GET').toUpperCase();
	if (!['GET', 'HEAD'].includes(method)) {
		return methodSiteResponse();
	}
	const requestPath = normalizeDrivePath(options.path || '', {
		allowRoot: true
	});
	const state = await readDriveState(options.aliasId, options.$i);
	const resolution = resolveSiteRequest({ requestPath, state });
	if (!resolution || resolution.blocked) {
		return blockedSiteResponse(options.aliasId);
	}
	const indexPath = publicIndexPath(state, resolution.drivePath);
	if (indexPath && !requestHasTrailingSlash(options.url)) {
		return withSiteHeaders(
			redirectSiteResponse(options.url),
			options.aliasId,
			resolution
		);
	}
	const selectedPath = indexPath || resolution.drivePath;
	let result = await publicSiteResponse(options, selectedPath, method);
	if (needsMappedNotFound(result, selectedPath, resolution)) {
		result = await mappedNotFound(
			options,
			method,
			result,
			resolution.fallbackPath
		);
	}
	return withSiteHeaders(result, options.aliasId, resolution);
}

function publicIndexPath(state, logicalPath) {
	const candidate = logicalPath
		? `${logicalPath}/index.html`
		: 'index.html';
	return isPublicFile(state.entries[candidate]) ? candidate : null;
}

function requestHasTrailingSlash(value) {
	const url = new URL(String(value || '/'), 'https://awtsmoos.com');
	return url.pathname.endsWith('/');
}

function needsMappedNotFound(result, selectedPath, resolution) {
	return result.statusCode === 404
		&& selectedPath !== resolution.fallbackPath;
}

function isPublicFile(entry) {
	return entry?.type === 'file'
		&& !entry.trashedAt
		&& entry.visibility === 'public';
}

module.exports = {
	buildSiteResponse,
	publicIndexPath,
	requestHasTrailingSlash
};
