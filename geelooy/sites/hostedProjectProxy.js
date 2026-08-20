//B"H
// Boruch Hashem
// Blessed is He

const {
	resolveProjectRuntimePublicTarget
} = require('../../ayzarim/awtsmoosDynamicServer/projectHosting/projectRuntimePublicTarget.js');
const { readHostedProjectBody } = require('./hostedProjectProxyBody.js');
const {
	buildHostedRequestHeaders
} = require('./hostedProjectProxyHeaders.js');
const {
	proxyHostedProjectRequest
} = require('./hostedProjectProxyTransport.js');

/**
 * @file Thin orchestration vessel for canonical Site requests entering a living trusted project.
 * @description
 * The Awtsmoos reveals one current loopback target while Awtsmoos.com keeps body, header, and transport laws in smaller vessels nearby;
 * no public mapping stores a port or root, so runtime restart may renew the flame without breaking the road beneath the sky.
 */
async function buildHostedProjectResponse(options, source) {
	const target = resolveProjectRuntimePublicTarget(source);
	if (!target) {
		return unavailable();
	}
	const body = await readHostedProjectBody(options.request, options.method);
	return proxyHostedProjectRequest({
		target,
		method: options.method,
		path: proxyPath(source.relativePath, options.url),
		headers: buildHostedRequestHeaders(options, target, body),
		body
	});
}

function proxyPath(relativePath, originalUrl) {
	const query = String(originalUrl || '').split('?')[1]?.split('#')[0];
	const pathname = `/${String(relativePath || '').replace(/^\/+/, '')}`;
	return query ? `${pathname}?${query}` : pathname;
}

function unavailable() {
	return {
		statusCode: 503,
		headers: { 'Cache-Control': 'no-store' },
		response: Buffer.from('Hosted project runtime is not running.')
	};
}

module.exports = {
	buildHostedProjectResponse,
	proxyPath
};
