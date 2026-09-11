// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { buildProductCommerceModel } from "../model.js";

test("product model separates repeatable credits from durable supporter ownership", () => {
	const model = buildProductCommerceModel(
		{ id: "docs" },
		{ ok: true, skus: [
			{ id: "docs.supporter.spark.001", productId: "docs", kind: "durable_entitlement", available: true, pricePerutahs: 50000, title: "Spark" },
			{ id: "docs.credits.spark.001", productId: "docs", kind: "consumable_credit_pack", available: true, pricePerutahs: 50000, creditUnits: 50, title: "50 Credits" },
			{ id: "docs.native.001", productId: "docs", kind: "durable_entitlement", available: true, pricePerutahs: 1, title: "Native" }
		] },
		{ ok: true, entitlements: [{ skuId: "docs.supporter.spark.001" }], productCredits: [{ productId: "docs", balance: 12, lifetimePurchased: 50 }] },
		{ ok: true, wallet: { purchasedBalance: 50000 }, pricing: { perutahsPerUsdCent: 500 } }
	);
	assert.equal(model.authenticated, true);
	assert.equal(model.purchasedBalance, 50000);
	assert.equal(model.productCreditBalance, 12);
	assert.equal(model.perutahsPerDollar, 50000);
	assert.deepEqual(model.offers.map(offer => offer.kind), ["consumable_credit_pack", "durable_entitlement"]);
	assert.equal(model.offers[0].creditUnits, 50);
	assert.equal(model.offers[1].owned, true);
});
