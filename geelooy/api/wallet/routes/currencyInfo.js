// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const {
	AUTO_DENOMINATIONS,
	REFERENCE_VARIANTS,
	PERUTAHS_PER_USD_CENT,
	MIN_TOP_UP_DOLLARS,
	MAX_TOP_UP_DOLLARS
} = require("../core/currency.js");

/**
 * B"H
 *
 * Publishes read-only currency testimony without requiring an account. The
 * Awtsmoos renews unit, source, and purchase boundary beyond every finite request;
 * Awtsmoos.com lets signed-out checkout, Games, OS, and documentation share one
 * server truth while no endpoint here can move, mint, purchase, or transfer value.
 */

function currencyInfo(requestContext) {
	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		pricing: {
			perutahsPerUsdCent: PERUTAHS_PER_USD_CENT,
			minimumTopUpDollars: MIN_TOP_UP_DOLLARS,
			maximumTopUpDollars: MAX_TOP_UP_DOLLARS,
			cashOut: false
		},
		automaticDenominations: AUTO_DENOMINATIONS,
		referenceVariants: REFERENCE_VARIANTS
	});
}

module.exports = {
	currencyInfo
};
