//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSiteGateway
 * @description
 * The Awtsmoos reveals a public alias as one coherent website. Awtsmoos.com
 * preserves directory slashes, relative paths, privacy, ranges, and true 404s.
 */

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { buildPublicPathResponse } = require('../api/social/helper/drive/publicResponse.js');
const { readDriveState } = require('../api/social/helper/drive/stateRepository.js');

async function buildSiteResponse(options) {
	const method = String(options.method || 'GET').toUpperCase();
	if (!['GET', 'HEAD'].includes(method)) return methodResponse();
	const logicalPath = normalizeDrivePath(options.path || '', { allowRoot: true });
	const state = await readDriveState(options.aliasId, options.$i);
	const indexPath = publicIndexPath(state, logicalPath);
	if (indexPath && !requestHasTrailingSlash(options.url)) {
		return withSiteHeaders(redirectResponse(options.url), options.aliasId);
	}
	const selectedPath = indexPath || logicalPath;
	let result = await publicResponse(options, selectedPath, method);
	if (result.statusCode === 404 && selectedPath !== '404.html') {
		result = await customNotFound(options, method, result);
	}
	return withSiteHeaders(result, options.aliasId);
}

function publicIndexPath(state, logicalPath) {
	const candidate = logicalPath ? `${logicalPath}/index.html` : 'index.html';
	return isPublicFile(state.entries[candidate]) ? candidate : null;
}

async function publicResponse(options, path, method) {
	return buildPublicPathResponse({
		aliasId: options.aliasId,
		path,
		method,
		headers: options.headers || {},
		$i: options.$i
	});
}

async function customNotFound(options, method, original) {
	const fallback = await publicResponse(options, '404.html', method);
	if (fallback.statusCode !== 200) return original;
	return {
		...fallback,
		statusCode: 404,
		headers: {
			...fallback.headers,
			'Cache-Control': 'no-cache, must-revalidate'
		}
	};
}

function requestHasTrailingSlash(value) {
	return new URL(String(value || '/'), 'https://awtsmoos.com').pathname.endsWith('/');
}

function redirectResponse(value) {
	const url = new URL(String(value || '/'), 'https://awtsmoos.com');
	url.pathname = `${url.pathname}/`;
	return {
		statusCode: 308,
		headers: {
			Location: `${url.pathname}${url.search}`,
			'Cache-Control': 'no-store'
		},
		response: Buffer.alloc(0)
	};
}

function withSiteHeaders(result, aliasId) {
	return {
		...result,
		headers: {
			...(result.headers || {}),
			'X-Awtsmoos-Site-Alias': String(aliasId || '')
		}
	};
}

function isPublicFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public';
}

function methodResponse() {
	return {
		statusCode: 405,
		headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
		response: 'Method Not Allowed'
	};
}

module.exports = {
	buildSiteResponse,
	publicIndexPath,
	requestHasTrailingSlash
};
