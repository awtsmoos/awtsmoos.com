//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ResourceQuoteRoute
 * @description Exposes read-only Awtsmoos resource pricing testimony. This route
 * never reserves or spends value; it only projects server-owned rates.
 */

const { quoteResource } = require("../core/commerce/resourceQuotePolicy.js");
const { json } = require("../core/respond.js");

async function resourceQuote(requestContext) {
	const query = requestContext.paramKinds?.GET || requestContext.$_GET || {};
	const result = quoteResource({
		executionMode: query.executionMode,
		resourceId: query.resourceId,
		units: query.units
	});
	return json(requestContext, {
		BH: "B\"H",
		...result
	}, result.ok ? 200 : 400);
}

module.exports = { resourceQuote };
