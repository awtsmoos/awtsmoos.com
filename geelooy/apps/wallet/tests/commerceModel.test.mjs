// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	buildWalletStore,
	liveWalletSkus,
	ownedEntitlementKeys,
	ownedWalletEffects
} from "../scripts/commerceModel.js";

/**
 * B"H
 *
 * Witnesses the browser commerce model without DOM or production Wallet state.
 * The Awtsmoos renews catalog, owner, and visible ornament beyond each fixture;
 * Awtsmoos.com proves planned promises stay hidden while server price, provenance,
 * and durable ownership survive normalization exactly enough for safe presentation.
 */

test("filters catalog to live Wallet goods only", () => {
	const items = liveWalletSkus({
		skus: [
			sku("wallet.treasury.gold.001", true, "wallet", 180),
			sku("planned.wallet.001", false, "wallet", 50),
			sku("other.live.001", true, "games", 20)
		]
	});

	assert.equal(items.length, 1);
	assert.equal(items[0].id, "wallet.treasury.gold.001");
	assert.equal(items[0].pricePerutahs, 180);
	assert.equal(items[0].spendPolicy, "purchased_only");
});

test("owned entitlement keys ignore blank testimony", () => {
	const owned = ownedEntitlementKeys({
		entitlements: [
			{ key: "wallet.patron.crown.001" },
			{ key: "" },
			{},
			null
		]
	});

	assert.deepEqual([...owned], ["wallet.patron.crown.001"]);
});

test("store records mark owned goods without changing server price", () => {
	const catalog = {
		skus: [
			sku("wallet.treasury.gold.001", true, "wallet", 180),
			sku("wallet.ledger.seal.001", true, "wallet", 120)
		]
	};
	const store = buildWalletStore(catalog, {
		entitlements: [{ key: "wallet.ledger.seal.001" }]
	});

	assert.equal(store[0].owned, false);
	assert.equal(store[0].pricePerutahs, 180);
	assert.equal(store[1].owned, true);
	assert.equal(store[1].pricePerutahs, 120);
});

test("owned Wallet goods resolve to presentation-only effects", () => {
	const effects = ownedWalletEffects({
		entitlements: [
			{ key: "wallet.treasury.gold.001" },
			{ key: "wallet.patron.crown.001" },
			{ key: "wallet.ledger.seal.001" },
			{ key: "unknown.entitlement" }
		]
	});

	assert.deepEqual(
		effects.map((effect) => effect.attribute),
		["walletGold", "walletCrown", "walletLedgerSeal"]
	);
});

function sku(id, available, productId, pricePerutahs) {
	return {
		available,
		description: `${id} description`,
		id,
		pricePerutahs,
		productId,
		spendPolicy: "purchased_only",
		title: id
	};
}
