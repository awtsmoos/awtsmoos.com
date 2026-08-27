//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyService
 * @description
 * The Awtsmoos composes measured public hops into one browser navigation.
 * Awtsmoos.com revalidates every redirect, isolates cross-origin authorization,
 * and returns aggregate peruta testimony without becoming an unrestricted relay.
 */

const { normalizeProxyUrl } = require('./proxyUrlPolicy.js');
const { withoutAuthorization } = require('./proxyHeaders.js');
const { ProxyCookieJarStore } = require('./proxyCookieJar.js');
const { ProxyRateLimiter } = require('./proxyRateLimiter.js');
const { ProxyHopService } = require('./proxyHopService.js');
const { buildProxyResponse } = require('./proxyResponse.js');
const {
	normalizeProxyMethod,
	proxyRequestBody,
	redirectedProxyRequest
} = require('./proxyRequestPolicy.js');

const MAX_REDIRECTS = 5;

class ProxyService {
	constructor(dependencies = {}) {
		this.cookies = dependencies.cookies || new ProxyCookieJarStore();
		this.limiter = dependencies.limiter || new ProxyRateLimiter();
		this.hops = dependencies.hops || new ProxyHopService({
			cookies: this.cookies,
			limiter: this.limiter,
			resolveTarget: dependencies.resolveTarget,
			transport: dependencies.transport
		});
	}

	async fetch(input) {
		assertIdentity(input.userId);
		let url = normalizeProxyUrl(input.url);
		let method = normalizeProxyMethod(input.method);
		let body = proxyRequestBody(input, method);
		let userHeaders = input.headers || {};
		let initiatorUrl = input.initiatorUrl ? normalizeProxyUrl(input.initiatorUrl) : null;
		const redirects = [];
		const usage = { requests: 0, bytes: 0, perutas: 0 };
		for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
			const result = await this.hops.fetch({
				...input, url, method, body, userHeaders, initiatorUrl
			});
			addUsage(usage, result.usage);
			if (!isRedirect(result.status) || !result.headers.location) {
				return buildProxyResponse({
					result,
					url,
					redirects,
					usage,
					jar: this.cookies.jarMetadata(input.userId, input.jarId)
				});
			}
			if (hop === MAX_REDIRECTS) throw proxyError('PROXY_REDIRECT_LIMIT', 508);
			const nextUrl = normalizeProxyUrl(result.headers.location, url);
			redirects.push({ from: url.toString(), to: nextUrl.toString(), status: result.status });
			if (nextUrl.origin !== url.origin) userHeaders = withoutAuthorization(userHeaders);
			({ method, body } = redirectedProxyRequest(method, body, result.status));
			initiatorUrl = url;
			url = nextUrl;
		}
	}
}

function addUsage(total, value = {}) {
	total.requests += value.requests || 0;
	total.bytes += value.bytes || 0;
	total.perutas += value.perutas || 0;
}

function isRedirect(status) {
	return [301, 302, 303, 307, 308].includes(status);
}

function assertIdentity(userId) {
	if (!userId) throw proxyError('PROXY_USER_REQUIRED', 401);
}

function proxyError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	ProxyService,
	MAX_REDIRECTS
};
