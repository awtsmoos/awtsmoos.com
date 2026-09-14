//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceCreate
 * @description Creates bounded seller listings inside the Wallet transaction lock.
 * Delivery references remain server-private until a buyer owns the listing.
 */

const crypto = require("crypto");
const {
	deliveryRef,
	listingDescription,
	listingPrice,
	listingTitle
} = require("./marketplacePolicy.js");
const { ensureMarketplace, listingView } = require("./marketplaceState.js");

const KINDS = new Set(["blueprint", "workflow", "component", "business-system"]);

function createMarketplaceListingInside(database, sellerUserId, input = {}, now = Date.now()) {
	ensureMarketplace(database);
	const kind = String(input.kind || "blueprint").trim();
	if (!KINDS.has(kind)) {
		return { ok: false, error: "invalid_marketplace_kind" };
	}
	const id = `market_${crypto.randomBytes(9).toString("hex")}`;
	const listing = {
		id,
		title: listingTitle(input.title),
		description: listingDescription(input.description),
		pricePerutahs: listingPrice(input.pricePerutahs),
		kind,
		deliveryRef: deliveryRef(input.deliveryRef),
		sellerUserId,
		sellerAlias: String(input.sellerAlias || "").slice(0, 100),
		buyers: {},
		active: true,
		createdAt: now,
		updatedAt: now
	};
	database.marketplaceListings[id] = listing;
	return { ok: true, listing: listingView(listing, sellerUserId) };
}

module.exports = { createMarketplaceListingInside };
