//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceState
 * @description Owns durable marketplace collections and public projections while
 * treasury mutation stays in separate modules.
 */

function ensureMarketplace(database) {
	database.marketplaceListings ||= {};
	database.marketplaceSales = Array.isArray(database.marketplaceSales)
		? database.marketplaceSales
		: [];
	database.marketplaceTreasuryPerutahs = Math.max(
		0,
		Number(database.marketplaceTreasuryPerutahs) || 0
	);
	return database.marketplaceListings;
}

function listingView(listing, viewerUserId = "") {
	return Object.freeze({
		id: listing.id,
		title: listing.title,
		description: listing.description,
		pricePerutahs: listing.pricePerutahs,
		kind: listing.kind,
		sellerAlias: listing.sellerAlias || "",
		ownedByViewer: Boolean(listing.buyers?.[viewerUserId]),
		createdAt: listing.createdAt,
		updatedAt: listing.updatedAt
	});
}
function listMarketplaceListings(database, viewerUserId = "") {
	ensureMarketplace(database);
	return Object.values(database.marketplaceListings)
		.filter(listing => listing?.active === true)
		.sort((left, right) => right.createdAt - left.createdAt)
		.map(listing => listingView(listing, viewerUserId));
}

function findMarketplaceListing(database, rawListingId) {
	ensureMarketplace(database);
	return database.marketplaceListings[String(rawListingId || "")] || null;
}

function findMarketplaceSale(database, buyerUserId, idempotencyKey) {
	ensureMarketplace(database);
	return database.marketplaceSales.find(sale => {
		return sale.buyerUserId === buyerUserId
			&& sale.idempotencyKey === idempotencyKey;
	}) || null;
}

module.exports = {
	ensureMarketplace,
	findMarketplaceListing,
	findMarketplaceSale,
	listMarketplaceListings,
	listingView
};
