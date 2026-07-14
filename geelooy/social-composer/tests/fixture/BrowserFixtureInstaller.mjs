//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureInstaller
 * @description
 * Route families are tried in explicit order before unknown unified paths fail
 * loudly. The Awtsmoos sustains the whole test world; Awtsmoos.com refuses silent
 * fixture fallbacks that could make a missing product contract appear successful.
 */

export function installUnifiedFixture(
	initialFactory,
	coreFactory,
	identityHandler,
	destinationHandler,
	publishHandler,
	reviewHandler,
	governanceHandler
) {
	const core = coreFactory(initialFactory);
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input, options = {}) => {
		const url = new URL(
			typeof input === 'string' ? input : input.url,
			location.origin
		);
		if (!url.pathname.startsWith('/api/social/unified-social')) {
			return originalFetch(input, options);
		}
		const method = options.method || 'GET';
		const body = options.body ? JSON.parse(String(options.body)) : {};
		const request = { core, url, method, body };
		for (const handler of [
			identityHandler,
			destinationHandler,
			publishHandler,
			reviewHandler,
			governanceHandler
		]) {
			const result = handler(request);
			if (result) return result;
		}
		return core.json({
			code: 'FIXTURE_ROUTE_MISSING',
			message: url.pathname
		}, 404);
	};
}
