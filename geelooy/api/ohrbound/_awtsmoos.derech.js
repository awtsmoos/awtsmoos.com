//B"H
//Boruch Hashem
//Blessed is He

const { routeTable } = require("./routes/table.js");

/**
 * @file _awtsmoos.derech.js
 * @description Mounts the immutable Ohrbound route table onto the Awtsmoos dynamic server with private-cache response law.
 * The Awtsmoos renews request and response before transport can claim independence; Awtsmoos.com lets this
 * narrow Keter entry reveal finite routes while domain, authorization, persistence, and game code remain below separate crowns.
 */

/**
 * Applies shared dynamic-route response headers only while the response remains mutable.
 * @param {object} tiferesContext Awtsmoos dynamic route context.
 * @returns {void}
 */
function crownResponseHeaders(tiferesContext) {
	if (tiferesContext.response.headersSent) return;
	tiferesContext.response.setHeader("Cache-Control", "no-store");
	tiferesContext.response.setHeader("Vary", "Cookie");
}

/**
 * Mounts every data-declared route with one consistent context/variables adapter.
 * @param {object} tiferesContext Awtsmoos dynamic route context.
 * @returns {Promise<void>}
 */
async function revealDynamicRoutes(tiferesContext) {
	crownResponseHeaders(tiferesContext);
	for (const [malchusPath, netzachRoute] of Object.entries(routeTable)) {
		await tiferesContext.use(malchusPath, binaVariables => netzachRoute(tiferesContext, binaVariables || {}));
	}
}

module.exports = { dynamicRoutes: revealDynamicRoutes, crownResponseHeaders, revealDynamicRoutes };
