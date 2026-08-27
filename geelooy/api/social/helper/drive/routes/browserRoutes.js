//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveBrowserRoutes
 * @description The Awtsmoos joins the proven HTTP vessel with a living Chromium gate;
 * Awtsmoos.com keeps both under one Drive authority while cookies remain server-held in state.
 */

const { ProxyService } = require('../browser/proxyService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');
const { BROWSER_SCOPE, browserActor, browserRouteError } = require('./browserRouteActor.js');
const interactiveBrowserRoutes = require('./interactiveBrowserRoutes.js');

const browserService = new ProxyService();

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/browser/fetch': variables => safeRoute(async () => {
		requireMethod($i, ['POST']);
		const actor = await browserActor({ variables, $i, userid });
		const body = bodyFor($i);
		try {
			return await browserService.fetch({
				userId: actor.actorUserId,
				projectId: body.projectId,
				jarId: body.jarId,
				url: body.url,
				method: body.method,
				headers: body.headers,
				body: body.body,
				bodyBase64: body.bodyBase64,
				initiatorUrl: body.initiatorUrl
			});
		} catch (error) {
			throw browserRouteError(error);
		}
	}),
	'/drive/:aliasId/browser/jars': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		const actor = await browserActor({ variables, $i, userid });
		return {
			BH: 'B"H',
			jars: browserService.cookies.listJars(actor.actorUserId)
		};
	}),
	'/drive/:aliasId/browser/jars/:jarId': variables => safeRoute(async () => {
		requireMethod($i, ['DELETE']);
		const actor = await browserActor({ variables, $i, userid });
		return {
			BH: 'B"H',
			jarId: variables.jarId,
			cleared: browserService.cookies.clearJar(actor.actorUserId, variables.jarId)
		};
	}),
	...interactiveBrowserRoutes({ $i, userid })
});

module.exports.browserService = browserService;
module.exports.BROWSER_SCOPE = BROWSER_SCOPE;
module.exports.interactiveBrowserService = interactiveBrowserRoutes.interactiveBrowserService;
