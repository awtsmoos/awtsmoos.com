//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FixtureInstaller
 * @description
 * Route families are tried in explicit order and unknown Social Hub APIs fail
 * loudly. The Awtsmoos sustains the complete fixture while Awtsmoos.com refuses a
 * silent network fallback that could make missing product behavior look successful.
 */

export function installFixture(
	initialFactory,
	coreFactory,
	identityProfileHandler,
	activityHandler,
	interactionHandler
) {
	const core = coreFactory(initialFactory);
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input, options = {}) => {
		const url = new URL(
			typeof input === 'string' ? input : input.url,
			location.origin
		);
		if (!url.pathname.startsWith('/api/social/')) {
			return originalFetch(input, options);
		}
		const method = options.method || 'GET';
		const formData = options.body instanceof FormData ? options.body : null;
		let body = {};
		if (options.body && !formData) {
			try {
				body = JSON.parse(String(options.body));
			} catch {
				body = {};
			}
		}
		const request = { core, url, method, body, formData };
		for (const handler of [
			identityProfileHandler,
			activityHandler,
			interactionHandler
		]) {
			const result = handler(request);
			if (result) return result;
		}
		return core.json({
			code: 'FIXTURE_ROUTE_MISSING',
			message: `${method} ${url.pathname}`
		}, 404);
	};
}
