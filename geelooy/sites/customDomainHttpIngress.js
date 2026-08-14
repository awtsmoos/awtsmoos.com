//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CustomDomainHttpIngress
 * @description
 * The Awtsmoos judges Host identity before filesystem routing begins. Platform names
 * continue untouched; a verified active tenant name enters its one bound site; every
 * other external name ends here so it cannot borrow Awtsmoos.com's platform routes.
 */

const { buildCustomDomainResponse } = require('./customDomainGateway.js');
const {
	canonicalRequestHost,
	isPlatformRequestHost
} = require('./requestHostPolicy.js');

function createCustomDomainHttpIngress(options) {
	const platformHosts = options.platformHosts || process.env.AWTSMOOS_PLATFORM_HOSTS || [];
	return async function customDomainHttpIngress(request, response) {
		const rawHost = request.headers?.host || '';
		if (isPlatformRequestHost(rawHost, platformHosts)) return false;
		const hostname = canonicalRequestHost(rawHost);
		if (!hostname) return closeExternalHost(response);
		try {
			const result = await buildCustomDomainResponse({
				host: hostname,
				path: rawRequestPath(request.url),
				url: request.url,
				method: request.method,
				headers: request.headers || {},
				$i: driveContext(options.dynamicServer, request)
			});
			if (!result) return closeExternalHost(response);
			writeGatewayResponse(response, result);
			return true;
		} catch (error) {
			if (String(error.code || '').startsWith('PATH_')) {
				return badPathResponse(response);
			}
			throw error;
		}
	};
}

function driveContext(dynamicServer, request) {
	return {
		db: dynamicServer?.db || null,
		request
	};
}

function rawRequestPath(url) {
	const raw = String(url || '/');
	const pathname = raw.split('?')[0].split('#')[0];
	if (!pathname.startsWith('/')) {
		const error = new Error('PATH_REQUIRED');
		error.code = 'PATH_REQUIRED';
		throw error;
	}
	return pathname.replace(/^\/+/, '');
}

function writeGatewayResponse(response, result) {
	response.writeHead(result.statusCode || 200, result.headers || {});
	response.end(result.response || Buffer.alloc(0));
}

function closeExternalHost(response) {
	const body = Buffer.from('Site not available');
	response.writeHead(421, {
		'Content-Type': 'text/plain; charset=utf-8',
		'Content-Length': String(body.length),
		'Cache-Control': 'no-store'
	});
	response.end(body);
	return true;
}

function badPathResponse(response) {
	const body = Buffer.from('Bad request path');
	response.writeHead(400, {
		'Content-Type': 'text/plain; charset=utf-8',
		'Content-Length': String(body.length),
		'Cache-Control': 'no-store'
	});
	response.end(body);
	return true;
}

module.exports = {
	createCustomDomainHttpIngress,
	driveContext,
	rawRequestPath,
	writeGatewayResponse
};
