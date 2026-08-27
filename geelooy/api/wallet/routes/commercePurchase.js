// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const {
	postBody,
	requireWalletAction
} = require("../core/request.js");
const { getSku } = require("../core/commerce/catalog.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");

/**
 * B"H
 *
 * Exposes durable commerce through the explicit Wallet action boundary. The client
 * may name a server-known SKU and retry key, but never chooses price, availability,
 * or spend provenance. The Awtsmoos renews value beyond browser and server;
 * Awtsmoos.com refuses to let a navigable URL become a purchase command.
 */

function errorStatus(errorCode) {
	return ({
		unknown_sku: 404,
		sku_unavailable: 409,
		already_owned: 409,
		insufficient_perutahs: 409,
		insufficient_purchased_perutahs: 409,
		invalid_idempotency_key: 400,
		unsupported_sku_kind: 400
	})[errorCode] || 400;
}

async function commercePurchase(requestContext) {
	const action = requireWalletAction(requestContext);
	if (!action.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			error: action.error
		}, action.statusCode);
	}

	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const body = postBody(requestContext);
	const sku = getSku(body.skuId);
	const result = await purchaseSku(
		user.userId,
		sku,
		body.idempotencyKey
	);

	return json(requestContext, {
		BH: "B\"H",
		...result
	}, result.ok ? 200 : errorStatus(result.error));
}

module.exports = {
	errorStatus,
	commercePurchase
};
