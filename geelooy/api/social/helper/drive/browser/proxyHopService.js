//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyHopService
 * @description The Awtsmoos measures one public crossing as requests, bytes,
 * perutas, cookies, and a pinned peer; Awtsmoos.com may echo a validated local
 * browser voice while every redirect hop still pays its honest measured share.
 */

const { resolvePublicTarget } = require('./publicAddressPolicy.js');
const { buildProxyRequestHeaders } = require('./proxyHeaders.js');
const { ProxyCookieJarStore } = require('./proxyCookieJar.js');
const { ProxyRateLimiter, proxyRateKey } = require('./proxyRateLimiter.js');
const {
	requestPerutas,
	responsePerutas,
	maxResponseBytesForPerutas
} = require('./proxyPerutaPolicy.js');
const { requestPinned, DEFAULT_MAX_BYTES } = require('./proxyTransport.js');

class ProxyHopService {
	constructor(dependencies = {}) {
		this.resolveTarget = dependencies.resolveTarget || resolvePublicTarget;
		this.transport = dependencies.transport || requestPinned;
		this.cookies = dependencies.cookies || new ProxyCookieJarStore();
		this.limiter = dependencies.limiter || new ProxyRateLimiter();
	}

	async fetch(input) {
		const requestCost = requestPerutas(input.body.length);
		const ticket = this.limiter.begin(proxyRateKey(input), requestCost);
		try {
			const target = await this.resolveTarget(input.url);
			const cookie = this.cookies.cookieHeader({
				userId: input.userId,
				jarId: input.jarId,
				url: input.url,
				method: input.method,
				initiatorUrl: input.initiatorUrl
			});
			const headers = buildProxyRequestHeaders(
				input.userHeaders,
				cookie,
				input.browserProfile
			);
			if (input.body.length) headers['content-length'] = String(input.body.length);
			const result = await this.transport({
				url: input.url,
				address: target.selected.address,
				family: target.selected.family,
				method: input.method,
				headers,
				body: input.body,
				maxBytes: responseByteCeiling(ticket)
			});
			const responseCost = responsePerutas(result.body.length);
			ticket.finish(result.body.length, responseCost);
			this.cookies.storeResponseCookies({
				userId: input.userId,
				jarId: input.jarId,
				url: input.url,
				setCookie: result.setCookie
			});
			return {
				...result,
				usage: {
					requests: 1,
					bytes: result.body.length,
					perutas: requestCost + responseCost
				}
			};
		} catch (error) {
			ticket.cancel();
			throw error;
		}
	}
}

function responseByteCeiling(ticket) {
	return Math.min(
		ticket.remainingBytes,
		maxResponseBytesForPerutas(ticket.remainingPerutas),
		DEFAULT_MAX_BYTES
	);
}

module.exports = {
	ProxyHopService,
	responseByteCeiling
};
