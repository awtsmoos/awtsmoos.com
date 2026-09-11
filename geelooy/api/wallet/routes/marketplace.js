//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceRoute
 * @description Returns active marketplace listings. Authentication enriches
 * ownership state but is not required to browse server-priced public goods.
 */

const { listMarketplace } = require("../core/marketplace/marketplaceService.js");
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");

async function marketplace(requestContext) {
	const user = requireUser(requestContext);
	const result = await listMarketplace(user.ok ? user.userId : "");
	return json(requestContext, {
		BH: "B\"H",
		...result
	});
}

module.exports = { marketplace };
