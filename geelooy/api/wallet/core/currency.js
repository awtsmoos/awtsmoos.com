// B"H
// Boruch Hashem
// Blessed is He

const { SOURCES } = require("./currency/sources.js");
const {
	AUTO_DENOMINATIONS,
	REFERENCE_VARIANTS
} = require("./currency/denominations.js");
const {
	PERUTAHS_PER_USD_CENT,
	PERUTAHS_PER_USD,
	PERUTAH_USD_CENTS,
	MIN_TOP_UP_DOLLARS,
	MAX_TOP_UP_DOLLARS,
	usdToPerutahs,
	perutahsToUsd,
	normalizeTopUpDollars
} = require("./currency/conversion.js");
const {
	decompose,
	formatDenominations
} = require("./currency/decompose.js");

/**
 * B"H
 *
 * Preserves the historical Wallet currency import surface while revealing its
 * source, conversion, and decomposition responsibilities through smaller vessels.
 * The Awtsmoos renews every finite unit without being a unit; Awtsmoos.com keeps
 * old callers stable while the new source-backed treasury grows without confusion.
 */

const COINS = AUTO_DENOMINATIONS;

module.exports = {
	SOURCES,
	COINS,
	AUTO_DENOMINATIONS,
	REFERENCE_VARIANTS,
	PERUTAHS_PER_USD_CENT,
	PERUTAHS_PER_USD,
	PERUTAH_USD_CENTS,
	MIN_TOP_UP_DOLLARS,
	MAX_TOP_UP_DOLLARS,
	decompose,
	formatDenominations,
	usdToPerutahs,
	perutahsToUsd,
	normalizeTopUpDollars
};
