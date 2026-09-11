//B"H
//Boruch Hashem
//Blessed be He
/** @file catalogBadges.test.mjs @description Proves marketplace summaries ignore native and unavailable goods. */

import test from "node:test";
import assert from "node:assert/strict";
import { summarizeCatalogOffers } from "../catalogSummary.js";

test("catalog summary exposes only live universal commerce goods", () => {
	const map = summarizeCatalogOffers([
		{ id: "docs.supporter.spark.001", productId: "docs", available: true, pricePerutahs: 50000 },
		{ id: "docs.supporter.builder.001", productId: "docs", available: true, pricePerutahs: 250000 },
		{ id: "docs.native.001", productId: "docs", available: true, pricePerutahs: 1 },
		{ id: "docs.supporter.future.001", productId: "docs", available: false, pricePerutahs: 2 }
	]);
	const summary = map.get("docs");
	assert.equal(summary.supporterCount, 2);
	assert.equal(summary.minimumSupporterPrice, 50000);
	assert.equal(summary.creditPackCount, 0);
});
