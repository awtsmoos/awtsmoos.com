//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplaceActionRoute
 * @description Exposes listing creation and purchases only through authenticated
 * POST requests carrying the explicit Wallet action header.
 */

const { json } = require("../core/respond.js");
const { postBody, requireWalletAction } = require("../core/request.js");
const { requireUser } = require("../core/user.js");
const { dispatchMarketplaceAction } = require("./marketplaceActionSupport.js");

async function marketplaceAction(requestContext) {
	const gate = requireWalletAction(requestContext);
	if (!gate.ok) return json(requestContext, failure(gate.error), gate.statusCode);
	const user = requireUser(requestContext);
	if (!user.ok) return json(requestContext, { BH: "B\"H", ok: false, ...user }, 401);
	try {
		const result = await dispatchMarketplaceAction(
			requestContext,
			user.userId,
			postBody(requestContext)
		);
		return json(requestContext, { BH: "B\"H", ...result }, statusFor(result));
	} catch (error) {
		return json(requestContext, failure(error.code || error.message), 400);
	}
}
function statusFor(result = {}) {
	if (result.ok) return 200;
	return ({
		marketplace_listing_not_found: 404,
		marketplace_already_owned: 409,
		marketplace_self_purchase: 409,
		insufficient_purchased_perutahs: 409,
		idempotency_conflict: 409
	})[result.error] || 400;
}

function failure(error) {
	return {
		BH: "B\"H",
		ok: false,
		error: error || "marketplace_action_failed"
	};
}

module.exports = {
	marketplaceAction,
	statusFor
};
