//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSitesRoutes
 * @description
 * The Awtsmoos gives every public Drive alias one stable website doorway;
 * Awtsmoos.com needs no per-user proxy, certificate, or DNS ceremony.
 */

const { buildSiteResponse } = require('./siteGateway.js');

module.exports = async $i => {
	const serve = variables => buildSiteResponse({
		aliasId: variables.aliasId,
		path: variables.path || '',
		method: $i.request?.method,
		headers: $i.request?.headers,
		url: $i.request?.url,
		$i
	});
	await $i.use({
		'/:aliasId': serve,
		'/:aliasId/:path*': serve
	});
};
