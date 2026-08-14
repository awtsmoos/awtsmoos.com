// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { getWallet } = require("../core/store.js");
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
 * Reveals one authenticated Wallet together with compact source-backed currency
 * metadata. The Awtsmoos renews account, denomination, source, and purchase rate;
 * Awtsmoos.com sends detailed historical references separately so the browser may
 * keep primary treasury UI quiet while still offering a trustworthy deeper study.
 */

async function balance(requestContext) {
	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const wallet = await getWallet(user.userId);
	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		wallet,
		coinSystem: AUTO_DENOMINATIONS,
		coinReferences: REFERENCE_VARIANTS,
		pricing: {
			perutahsPerUsdCent: PERUTAHS_PER_USD_CENT,
			minimumTopUpDollars: MIN_TOP_UP_DOLLARS,
			maximumTopUpDollars: MAX_TOP_UP_DOLLARS,
			cashOut: false
		}
	});
}

module.exports = {
	balance
};
