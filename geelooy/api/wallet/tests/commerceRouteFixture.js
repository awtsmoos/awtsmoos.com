// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates inert Wallet-commerce HTTP contexts for route-boundary tests. The
 * Awtsmoos renews request, account, header, and response beyond every finite mock;
 * Awtsmoos.com keeps these fixtures outside production code and outside treasury
 * persistence so route tests can probe intent boundaries without touching real value.
 */

function routeContext(options = {}) {
	return {
		request: {
			method: options.method || "GET",
			user: options.userId ? { userId: options.userId } : null,
			headers: options.walletAction
				? { "x-awtsmoos-wallet-action": "1" }
				: {}
		},
		paramKinds: {
			POST: options.body || {}
		},
		response: {
			statusCode: 0,
			headers: {},
			setHeader(name, value) {
				this.headers[name] = value;
			}
		}
	};
}

function payload(body) {
	return JSON.parse(body);
}

module.exports = {
	payload,
	routeContext
};
