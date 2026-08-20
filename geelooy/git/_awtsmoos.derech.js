//B"H
// Boruch Hashem
// Blessed is He

const { buildGitHttpResponse } = require('../api/social/helper/repositories/gitHttpGateway.js');

/**
 * @module AwtsmoosGitRoute
 * @description
 * The Awtsmoos gives every opted-in repository a standards-complete smart-HTTP
 * doorway. Awtsmoos.com binds the URL to stored repository identity before Git
 * sees the request, so ordinary clients can clone and push without VFS guessing.
 */

async function handleGit($i) {
	try {
		const request = $i.request || {};
		return await buildGitHttpResponse({
			aliasId: $i.$_GET.aliasId,
			path: $i.$_GET.path || '',
			method: request.method || 'GET',
			headers: request.headers || {},
			queryString: queryStringOf(request.url),
			body: request.rawBody ?? request.body,
			$i
		});
	} catch (error) {
		return gitErrorResponse(error);
	}
}

function queryStringOf(url) {
	const text = String(url || '');
	const index = text.indexOf('?');
	return index >= 0 ? text.slice(index + 1).split('#')[0] : '';
}

function gitErrorResponse(error) {
	const code = String(error?.code || 'GIT_HTTP_ERROR');
	const statusCode = code.includes('NOT_FOUND') ? 404 : 400;
	return {
		statusCode,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8'
		},
		response: code
	};
}

module.exports = ({ dynamicRoutes, $i }) => {
	dynamicRoutes({
		'/:aliasId/:path*': {
			GET: () => handleGit($i),
			POST: () => handleGit($i)
		}
	});
};
