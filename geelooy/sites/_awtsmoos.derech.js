//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSitesRoutes
 * @description
 * The Awtsmoos gives every public alias one stable doorway while Awtsmoos.com carries both still files and living APIs through the same canonical name;
 * the raw request is handed only to the hosted-project transport, where bodies and cookies may pass without teaching static Sites to execute code.
 */
const { buildSiteResponse } = require('./siteGateway.js');

module.exports = async $i => {
	const serve = variables => buildSiteResponse({
		aliasId: variables.aliasId,
		path: variables.path || '',
		method: $i.request?.method,
		headers: $i.request?.headers,
		request: $i.request,
		url: $i.request?.url,
		$i
	});
	await $i.use({
		'/:aliasId': serve,
		'/:aliasId/:path*': serve
	});
};
