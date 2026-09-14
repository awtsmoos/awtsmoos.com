//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceService
 * @description Places marketplace reads and seller/buyer treasury transitions behind
 * existing Wallet persistence and the serialized transaction lock.
 */

const { readWalletDb } = require("../persistence.js");
const { transact } = require("../transactionRunner.js");
const { createMarketplaceListingInside } = require("./marketplaceCreate.js");
const { purchaseMarketplaceListingInside } = require("./marketplacePurchase.js");
const { listMarketplaceListings } = require("./marketplaceState.js");

async function createMarketplaceListing(userId, input) {
	return transact(database => createMarketplaceListingInside(database, userId, input));
}

async function purchaseMarketplaceListing(userId, input) {
	return transact(database => purchaseMarketplaceListingInside(database, userId, input));
}

async function listMarketplace(userId = "") {
	const database = await readWalletDb();
	return {
		ok: true,
		listings: listMarketplaceListings(database, userId)
	};
}

module.exports = {
	createMarketplaceListing,
	listMarketplace,
	purchaseMarketplaceListing
};
