//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplacePurchase
 * @description Atomically transfers purchased Perutas from buyer to seller and
 * Awtsmoos treasury, grants buyer ownership, and reveals private delivery testimony.
 */

const crypto = require("crypto");
const { creditWalletBucket } = require("../balanceBuckets.js");
const { createTransaction, buildWalletView } = require("../ledger.js");
const { ensureWallet } = require("../transactionRunner.js");
const { debitPurchasedOnly } = require("../commerce/purchaseDebit.js");
const { feeSplit, listingId, retryKey } = require("./marketplacePolicy.js");
const {
	ensureMarketplace,
	findMarketplaceListing,
	findMarketplaceSale
} = require("./marketplaceState.js");

function purchaseMarketplaceListingInside(database, buyerUserId, input = {}, now = Date.now()) {
	ensureMarketplace(database);
	const id = listingId(input.listingId);
	const retry = retryKey(input.idempotencyKey);
	const listing = findMarketplaceListing(database, id);
	if (!listing?.active) return { ok: false, error: "marketplace_listing_not_found" };
	if (listing.sellerUserId === buyerUserId) return { ok: false, error: "marketplace_self_purchase" };

	const prior = findMarketplaceSale(database, buyerUserId, retry);
	if (prior) {
		return prior.listingId === id
			? success(database, listing, prior, buyerUserId, true)
			: { ok: false, error: "idempotency_conflict" };
	}
	if (listing.buyers?.[buyerUserId]) return { ok: false, error: "marketplace_already_owned" };
	const buyerWallet = ensureWallet(database, buyerUserId, now);
	const debit = debitPurchasedOnly(buyerWallet, listing.pricePerutahs);
	if (!debit.ok) {
		return {
			ok: false,
			error: "insufficient_purchased_perutahs",
			balance: debit.balance,
			needed: debit.needed
		};
	}
	const sellerWallet = ensureWallet(database, listing.sellerUserId, now);
	const split = feeSplit(listing.pricePerutahs);
	creditWalletBucket(sellerWallet, split.sellerPerutahs, "purchased");
	database.marketplaceTreasuryPerutahs += split.feePerutahs;
	buyerWallet.updatedAt = now;
	sellerWallet.updatedAt = now;

	const sale = createSale(listing, buyerUserId, retry, split, now);
	listing.buyers[buyerUserId] = sale.id;
	listing.updatedAt = now;
	database.marketplaceSales.push(sale);
	recordLedger(database, listing, buyerUserId, retry, split, now);
	return success(database, listing, sale, buyerUserId, false);
}

function createSale(listing, buyerUserId, retry, split, now) {
	return Object.freeze({
		id: `sale_${crypto.randomBytes(9).toString("hex")}`,
		listingId: listing.id,
		buyerUserId,
		sellerUserId: listing.sellerUserId,
		pricePerutahs: listing.pricePerutahs,
		feePerutahs: split.feePerutahs,
		sellerPerutahs: split.sellerPerutahs,
		idempotencyKey: retry,
		at: now
	});
}
function recordLedger(database, listing, buyerUserId, retry, split, now) {
	database.txs.push(createTransaction("marketplace_purchase", buyerUserId, -listing.pricePerutahs, {
		listingId: listing.id,
		balanceKind: "purchased",
		idempotencyKey: `marketplace:buy:${retry}`
	}, now));
	database.txs.push(createTransaction("marketplace_earning", listing.sellerUserId, split.sellerPerutahs, {
		listingId: listing.id,
		buyerUserId,
		balanceKind: "purchased"
	}, now));
}

function success(database, listing, sale, buyerUserId, deduplicated) {
	return {
		ok: true,
		deduplicated,
		sale,
		delivery: Object.freeze({
			kind: listing.kind,
			ref: listing.deliveryRef
		}),
		wallet: buildWalletView(database, buyerUserId)
	};
}

module.exports = { purchaseMarketplaceListingInside };
