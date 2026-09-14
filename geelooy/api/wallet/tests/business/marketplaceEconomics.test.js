//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file marketplaceEconomics.test.js
 * @description Proves closed-loop marketplace value conservation, privacy,
 * ownership, retry safety, and self-purchase protection.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { createWallet } = require("../../core/walletModel.js");
const { createMarketplaceListingInside } = require("../../core/marketplace/marketplaceCreate.js");
const { purchaseMarketplaceListingInside } = require("../../core/marketplace/marketplacePurchase.js");
const { listMarketplaceListings } = require("../../core/marketplace/marketplaceState.js");

function database() {
	const now = 1000;
	const buyer = createWallet("buyer", now);
	buyer.promotionalBalance = 600;
	buyer.purchasedBalance = 2000000;
	buyer.balance = 2000600;
	return {
		wallets: { buyer },
		txs: [],
		entitlements: {},
		commerceReceipts: []
	};
}
test("marketplace conserves purchased value and hides delivery before purchase", () => {
	const db = database();
	const created = createMarketplaceListingInside(db, "seller", {
		title: "Contractor Business System",
		description: "A reusable contractor website and workflow blueprint.",
		pricePerutahs: 1000000,
		kind: "business-system",
		deliveryRef: "awtsmoos://drive/marketplace/contractor-v1",
		sellerAlias: "seller"
	}, 2000);
	assert.equal(created.ok, true);
	assert.equal("deliveryRef" in created.listing, false);
	const publicListing = listMarketplaceListings(db, "buyer")[0];
	assert.equal("deliveryRef" in publicListing, false);

	const bought = purchaseMarketplaceListingInside(db, "buyer", {
		listingId: created.listing.id,
		idempotencyKey: "market-buy-0001"
	}, 3000);
	assert.equal(bought.ok, true);
	assert.equal(bought.delivery.ref, "awtsmoos://drive/marketplace/contractor-v1");
	assert.equal(db.wallets.buyer.purchasedBalance, 1000000);
	assert.equal(db.wallets.seller.purchasedBalance, 850000);
	assert.equal(db.marketplaceTreasuryPerutahs, 150000);
});
test("marketplace retry deduplicates and seller cannot buy own listing", () => {
	const db = database();
	const created = createMarketplaceListingInside(db, "seller", {
		title: "Agency Workflow",
		description: "Reusable client delivery workflow.",
		pricePerutahs: 500000,
		kind: "workflow",
		deliveryRef: "awtsmoos://drive/marketplace/agency-v1"
	}, 2000);
	const input = {
		listingId: created.listing.id,
		idempotencyKey: "market-buy-0002"
	};
	const first = purchaseMarketplaceListingInside(db, "buyer", input, 3000);
	const second = purchaseMarketplaceListingInside(db, "buyer", input, 4000);
	assert.equal(first.ok, true);
	assert.equal(second.ok, true);
	assert.equal(second.deduplicated, true);
	assert.equal(db.marketplaceSales.length, 1);
	assert.equal(db.marketplaceTreasuryPerutahs, 75000);
	const self = purchaseMarketplaceListingInside(db, "seller", {
		listingId: created.listing.id,
		idempotencyKey: "market-self-0001"
	}, 5000);
	assert.equal(self.error, "marketplace_self_purchase");
});
