//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const {
	SOURCE_KINDS,
	effectiveSiteSource
} = require('../api/social/helper/drive/siteSourcePolicy.js');
const { readDriveState } = require('../api/social/helper/drive/stateRepository.js');
const { resolveSiteRequest } = require('./siteResolution.js');
const { buildMappedSourceResponse } = require('./siteGatewaySource.js');

/**
 * @module PublicSiteGateway
 * @description
 * The Awtsmoos gives one canonical public identity to both quiet files and living APIs;
 * Awtsmoos.com keeps static gardens read-only while trusted hosted projects may receive full HTTP motion through a bounded loopback vessel, with no root or port exposed to the road.
 */
async function buildSiteResponse(options = {}) {
	const method = String(options.method || 'GET').toUpperCase();
	const requestPath = normalizeDrivePath(options.path || '', { allowRoot: true });
	const state = await readDriveState(options.aliasId, options.$i);
	const resolution = resolveSiteRequest({
		state,
		requestPath,
		siteId: options.siteId
	});
	if (!resolution || resolution.blocked) {
		return brandedResponse(siteNotFound(), options.aliasId);
	}
	const source = effectiveSiteSource(resolution.site);
	if (!methodAllowed(method, source.kind)) {
		return methodNotAllowed(source.kind);
	}
	if (requiresNamedRootRedirect(resolution, options.url, method)) {
		return brandedResponse(
			redirect(`${pathnameOf(options.url)}/`),
			options.aliasId,
			publicSiteId(resolution)
		);
	}
	const mapped = await buildMappedSourceResponse(options, resolution, method, state);
	if (mapped.directoryIndex && !requestHasTrailingSlash(options.url)) {
		return brandedResponse(
			redirect(`${pathnameOf(options.url)}/`),
			options.aliasId,
			publicSiteId(resolution)
		);
	}
	return brandedResponse(mapped.result, options.aliasId, publicSiteId(resolution));
}

function methodAllowed(method, sourceKind) {
	if (sourceKind === SOURCE_KINDS.HOSTED_PROJECT) {
		return ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method);
	}
	return ['GET', 'HEAD'].includes(method);
}

function methodNotAllowed(sourceKind) {
	const allow = sourceKind === SOURCE_KINDS.HOSTED_PROJECT
		? 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'
		: 'GET, HEAD';
	return {
		statusCode: 405,
		headers: { Allow: allow },
		response: Buffer.alloc(0)
	};
}

function requiresNamedRootRedirect(resolution, url, method) {
	return Boolean(
		['GET', 'HEAD'].includes(method)
		&& resolution.named
		&& !resolution.relativePath
		&& !requestHasTrailingSlash(url)
	);
}

function publicSiteId(resolution) {
	return resolution.named ? resolution.site?.id : '';
}

function siteNotFound() {
	return { statusCode: 404, headers: {}, response: Buffer.alloc(0) };
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

module.exports = { buildSiteResponse };
