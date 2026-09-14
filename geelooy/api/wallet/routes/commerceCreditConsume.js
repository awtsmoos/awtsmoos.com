// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { postBody, requireWalletAction } = require("../core/request.js");
const { spendProductCredits } = require("../core/commerce/productCreditService.js");

/** Debits product credits only through an authenticated explicit Wallet action. */
async function commerceCreditConsume(requestContext) {
	const action = requireWalletAction(requestContext);
	if (!action.ok) return respond(requestContext, action, action.statusCode);
	const user = requireUser(requestContext);
	if (!user.ok) return respond(requestContext, user, 401);
	const result = await spendProductCredits(user.userId, postBody(requestContext));
	return respond(requestContext, result, result.ok ? 200 : errorStatus(result.error));
}

function errorStatus(error) {
	return ({
		unknown_paid_action: 404,
		invalid_paid_action: 400,
		paid_action_unavailable: 409,
		invalid_idempotency_key: 400,
		insufficient_product_credits: 409,
		idempotency_conflict: 409
	})[error] || 400;
}

function respond(requestContext, result, statusCode) {
	return json(requestContext, {
		BH: "B\"H",
		ok: result.ok === true,
		...result
	}, statusCode);
}

module.exports = {
	commerceCreditConsume,
	errorStatus
};
