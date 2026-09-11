//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { buildCloudModel } from "./cloudModel.js";

/**
 * @file cloudModel.test.mjs
 * @description Proves Cloud offers remain derived from server Wallet testimony.
 */

const RATE = 500;
const LAUNCH_ID = "drive.service.launch.reservation.001";

/** Creates one public commerce-catalog record for model tests. */
function sku(overrides = {}) {
	return {
		available: true,
		description: "One-time reservation.",
		id: LAUNCH_ID,
		pricePerutahs: 9_950_000,
		title: "Launch reservation",
		...overrides
	};
}
test("signed-out visitors see server price without gaining purchase authority", () => {
	const model = buildCloudModel({
		catalog: { skus: [sku()] },
		currency: { pricing: { perutahsPerUsdCent: RATE } },
		balance: { ok: false },
		entitlements: { ok: false }
	});
	assert.equal(model.offers.length, 1);
	assert.equal(model.offers[0].dollars, 199);
	assert.equal(model.offers[0].authenticated, false);
	assert.equal(model.offers[0].canPurchase, false);
});

test("purchased balance chooses funding or purchase without using promotional value", () => {
	const base = {
		catalog: { skus: [sku()] },
		currency: { pricing: { perutahsPerUsdCent: RATE } },
		entitlements: { entitlements: [] }
	};
	const low = buildCloudModel({
		...base,
		balance: { ok: true, wallet: { purchasedBalance: 5_000_000, promotionalBalance: 99_000_000 } }
	});
	assert.equal(low.offers[0].needsFunding, true);
	assert.equal(low.offers[0].canPurchase, false);
	const funded = buildCloudModel({
		...base,
		balance: { ok: true, wallet: { purchasedBalance: 9_950_000 } }
	});
	assert.equal(funded.offers[0].needsFunding, false);
	assert.equal(funded.offers[0].canPurchase, true);
});

test("durable ownership wins over available balance and unrelated SKUs stay hidden", () => {
	const model = buildCloudModel({
		catalog: {
			skus: [
				sku(),
				sku({ id: "wallet.cosmetic.001" }),
				sku({ id: "drive.service.business.reservation.001", available: false })
			]
		},
		currency: { pricing: { perutahsPerUsdCent: RATE } },
		balance: { ok: true, wallet: { purchasedBalance: 99_000_000 } },
		entitlements: { entitlements: [{ key: LAUNCH_ID }] }
	});
	assert.equal(model.offers.length, 1);
	assert.equal(model.offers[0].owned, true);
	assert.equal(model.offers[0].canPurchase, false);
});
