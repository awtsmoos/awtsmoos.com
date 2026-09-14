//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceActionSupport
 * @description Dispatches authenticated marketplace mutations while resolving
 * public seller identity on the server rather than trusting browser account ids.
 */

const {
	createMarketplaceListing,
	purchaseMarketplaceListing
} = require("../core/marketplace/marketplaceService.js");
const { resolveSenderAlias } = require("../core/transferIdentity.js");

async function dispatchMarketplaceAction(requestContext, userId, body = {}) {
	const action = String(body.action || "").trim();
	if (action === "create") {
		const sellerAlias = await resolveSenderAlias(requestContext, userId);
		return createMarketplaceListing(userId, {
			...body,
			sellerAlias
		});
	}
	if (action === "buy") {
		return purchaseMarketplaceListing(userId, body);
	}
	return { ok: false, error: "unknown_marketplace_action" };
}

module.exports = { dispatchMarketplaceAction };
