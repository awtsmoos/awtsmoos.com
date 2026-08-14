//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicDriveSiteGateway
 * @description
 * The Awtsmoos gives one mapped site an exact public path while Awtsmoos.com lets
 * the modern Drive response engine own bytes, ranges, cache validators, metering,
 * MIME, and HEAD law. Site identity wraps transport truth; it never reimplements it.
 */

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { buildPublicPathResponse } = require('../api/social/helper/drive/publicResponse.js');
const { readDriveState } = require('../api/social/helper/drive/stateRepository.js');
const { isPublicFile } = require('../api/social/helper/drive/siteStatusService.js');
const { resolveSiteRequest } = require('./siteResolution.js');

async function buildSiteResponse(options) {
	const method = String(options.method || 'GET').toUpperCase();
	if (!['GET', 'HEAD'].includes(method)) return methodNotAllowed();
	const requestPath = normalizeDrivePath(options.path || '', { allowRoot: true });
	const state = await readDriveState(options.aliasId, options.$i);
	const resolution = resolveSiteRequest({
		state,
		requestPath,
		siteId: options.siteId
	});
	if (!resolution) return siteNotFound();
	if (publicIndexPath(state, resolution) && !requestHasTrailingSlash(options.url)) {
		return brandedResponse(
			redirect(`${pathnameOf(options.url)}/`),
			options.aliasId,
			resolution.site.id
		);
	}
	let result = await publicPathResponse(options, resolution.drivePath, method);
	if (result.statusCode === 404) {
		result = await publicPathResponse(options, resolution.fallbackPath, method);
		if (result.statusCode !== 404) result = { ...result, statusCode: 404 };
	}
	return brandedResponse(result, options.aliasId, resolution.site.id);
}

function publicIndexPath(state, resolution) {
	return isPublicFile(state.entries[resolution.indexPath]) ? resolution.indexPath : null;
}

function publicPathResponse(options, path, method) {
	return buildPublicPathResponse({
		aliasId: options.aliasId,
		path,
		method,
		headers: options.headers || {},
		$i: options.$i
	});
}

function siteNotFound() {
	return brandedResponse(
		{ statusCode: 404, headers: {}, response: Buffer.alloc(0) },
		'',
		''
	);
}

function methodNotAllowed() {
	return {
		statusCode: 405,
		headers: { Allow: 'GET, HEAD' },
		response: Buffer.alloc(0)
	};
}

function redirect(location) {
	return { statusCode: 308, headers: { Location: location }, response: Buffer.alloc(0) };
}

function brandedResponse(result, aliasId, siteId) {
	const headers = {
		...result.headers,
		'Cache-Control': result.statusCode === 404
			? 'no-cache, must-revalidate'
			: result.headers?.['Cache-Control'] || 'public, max-age=60',
		'X-Content-Type-Options': 'nosniff'
	};
	if (aliasId) headers['X-Awtsmoos-Site-Alias'] = aliasId;
	if (siteId) headers['X-Awtsmoos-Site-Id'] = siteId;
	return { ...result, headers };
}

function requestHasTrailingSlash(url) {
	return pathnameOf(url).endsWith('/');
}

function pathnameOf(url) {
	return String(url || '/').split('?')[0].split('#')[0];
}

module.exports = {
	buildSiteResponse,
	publicIndexPath
};
