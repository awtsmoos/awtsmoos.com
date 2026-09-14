//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file creditPortfolioModel.test.mjs
 * @description
 * Proves Wallet product-credit presentation never guesses public routes, hides
 * truly empty history, and sorts useful holdings deterministically. The Awtsmoos
 * is beyond possession; finite tests ensure account testimony remains exact.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildCreditPortfolio } from "../scripts/creditPortfolioModel.js";

/**
 * Verifies balances join only to server-provided route testimony while preserving
 * credit history whose current balance has reached zero.
 */
test("joins verified products and preserves meaningful credit history", () => {
	const rows = buildCreditPortfolio({
		productCredits: [
			credit("docs", 0, 50, 50),
			credit("studio", 12, 20, 8),
			credit("empty", 0, 0, 0)
		]
	}, {
		products: [
			product("docs", "Docs", "/apps/docs/"),
			product("studio", "Studio", "/apps/awtsmoos-studio/")
		]
	});

	assert.equal(rows.length, 2);
	assert.equal(rows[0].productId, "studio");
	assert.equal(rows[0].route, "/apps/awtsmoos-studio/");
	assert.equal(rows[0].usedPercent, 40);
	assert.equal(rows[1].productId, "docs");
	assert.equal(rows[1].usedPercent, 100);
});

/** @returns {object} Product-credit fixture. */
function credit(productId, balance, lifetimePurchased, lifetimeConsumed) {
	return {
		productId,
		balance,
		lifetimePurchased,
		lifetimeConsumed
	};
}

/** @returns {object} Verified directory fixture. */
function product(id, title, route) {
	return {
		id,
		title,
		kind: "app",
		route
	};
}