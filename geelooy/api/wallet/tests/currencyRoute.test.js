// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { currencyInfo } = require("../routes/currencyInfo.js");
const {
	payload,
	routeContext
} = require("./commerceRouteFixture.js");

/**
 * B"H
 *
 * Witnesses that source-backed Wallet pricing remains public read-only testimony.
 * The Awtsmoos renews cent, source, and denomination beyond every finite request;
 * Awtsmoos.com lets signed-out clients understand value without granting authority
 * to mint, transfer, purchase, or reinterpret historical reference variants.
 */

test("public currency route exposes tiny purchase rate and provider bounds", () => {
	const result = payload(currencyInfo(routeContext()));
	assert.equal(result.ok, true);
	assert.equal(result.pricing.perutahsPerUsdCent, 500);
	assert.equal(result.pricing.minimumTopUpDollars, 1);
	assert.equal(result.pricing.maximumTopUpDollars, 250);
	assert.equal(result.pricing.cashOut, false);
});

test("public currency route separates automatic units from variants", () => {
	const result = payload(currencyInfo(routeContext()));
	assert.equal(result.automaticDenominations.length, 10);
	assert.equal(result.automaticDenominations[0].id, "perutah");
	assert.equal(result.automaticDenominations.at(-1).id, "maneh");
	assert.equal(result.automaticDenominations.every((item) => item.auto), true);
	assert.deepEqual(
		result.referenceVariants.map((item) => [item.id, item.perutahs, item.auto]),
		[
			["gold-dinar-yerushalmi", 4608, false],
			["gold-dinar-bavli", 4800, false]
		]
	);
});
