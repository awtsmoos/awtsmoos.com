// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	AUTO_DENOMINATIONS,
	REFERENCE_VARIANTS,
	PERUTAHS_PER_USD_CENT,
	MIN_TOP_UP_DOLLARS,
	MAX_TOP_UP_DOLLARS,
	decompose,
	formatDenominations,
	normalizeTopUpDollars,
	perutahsToUsd,
	usdToPerutahs
} = require("../core/currency.js");

/**
 * B"H
 *
 * Freezes Awtsmoos Wallet's tiny atomic pricing and primary-source denomination
 * boundaries. The Awtsmoos renews cent, Perutah, source, and disagreement beyond
 * every finite ratio; Awtsmoos.com proves automatic arithmetic uses one compatible
 * ladder while conflicting gold exchange traditions remain reference testimony only.
 */

test("purchase pricing uses five hundred Perutahs per USD cent", () => {
	assert.equal(PERUTAHS_PER_USD_CENT, 500);
	assert.equal(usdToPerutahs(0.01), 500);
	assert.equal(usdToPerutahs(0.02), 1000);
	assert.equal(usdToPerutahs(1), 50000);
	assert.equal(usdToPerutahs(5), 250000);
	assert.equal(perutahsToUsd(50000), 1);
});

test("provider top-up bounds reject values outside one through two hundred fifty dollars", () => {
	assert.equal(MIN_TOP_UP_DOLLARS, 1);
	assert.equal(MAX_TOP_UP_DOLLARS, 250);
	assert.equal(normalizeTopUpDollars(0.01), null);
	assert.equal(normalizeTopUpDollars(5.126), 5.13);
	assert.equal(normalizeTopUpDollars(999), null);
	assert.equal(normalizeTopUpDollars("not-money"), null);
});

test("automatic denomination ladder matches source-backed Perutah ratios", () => {
	assert.deepEqual(
		AUTO_DENOMINATIONS.map((coin) => [coin.id, coin.perutahs]),
		[
			["perutah", 1],
			["kardiontes", 2],
			["mesumis", 4],
			["issar", 8],
			["pundyon", 16],
			["maah", 32],
			["dinar", 192],
			["sela", 768],
			["darkon", 1536],
			["maneh", 19200]
		]
	);
	assert.equal(AUTO_DENOMINATIONS.every((coin) => coin.auto === true), true);
	assert.equal(AUTO_DENOMINATIONS.every((coin) => Boolean(coin.sourceId)), true);
});

test("gold Dinar source disagreement remains reference-only", () => {
	assert.deepEqual(
		REFERENCE_VARIANTS.map((coin) => [coin.id, coin.perutahs, coin.auto]),
		[
			["gold-dinar-yerushalmi", 4608, false],
			["gold-dinar-bavli", 4800, false]
		]
	);
});

test("automatic decomposition never inserts reference-only gold variants", () => {
	const parts = decompose(50000);
	assert.equal(parts.some((part) => part.kind === "reference"), false);
	assert.equal(parts[0].id, "maneh");
	assert.equal(formatDenominations(38400), "2 Maneh");
});
