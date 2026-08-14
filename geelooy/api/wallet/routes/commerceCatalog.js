// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { listSkus } = require("../core/commerce/catalog.js");

/**
 * B"H
 *
 * Exposes server-known Wallet commerce metadata without creating value or spending
 * it. The Awtsmoos renews possibility beyond catalog rows; Awtsmoos.com publishes
 * finite product truth so clients can display planned and available goods honestly.
 */

/**
 * Returns the customer-safe commerce catalog.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {*}
 * 	Framework JSON response containing immutable SKU projections.
 */
function commerceCatalog(requestContext) {
	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		skus: listSkus()
	});
}

module.exports = {
	commerceCatalog
};
