// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const {
	postBody,
	requireWalletAction
} = require("../core/request.js");
const { createOrder } = require("../core/paypal.js");
const {
	normalizeTopUpDollars
} = require("../core/currency.js");

/**
 * B"H
 *
 * Creates a bounded PayPal top-up through one shared economic conversion boundary.
 * The Awtsmoos renews intention, provider, cent, and Perutah beyond every request;
 * Awtsmoos.com keeps minimum, maximum, and conversion rules in the currency core
 * so UI, provider metadata, capture verification, and purchased balance cannot drift.
 */

async function paypalCreate(requestContext) {
	const action = requireWalletAction(requestContext);
	if (!action.ok) {
		return json(
			requestContext,
			failure(action.error),
			action.statusCode
		);
	}

	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const dollars = normalizeTopUpDollars(
		postBody(requestContext).dollars
	);
	if (dollars === null) {
		return json(
			requestContext,
			failure("invalid_dollar_amount"),
			400
		);
	}

	try {
		const publicOrigin = process.env.AWTSMOOS_PUBLIC_ORIGIN
			|| "https://awtsmoos.com";
		const order = await createOrder({
			dollars,
			userId: user.userId,
			returnUrl: `${publicOrigin}/apps/wallet/?paypalReturn=1`,
			cancelUrl: `${publicOrigin}/apps/wallet/?paypalCancel=1`
		});
		return json(requestContext, {
			BH: "B\"H",
			ok: true,
			dollars,
			order
		});
	} catch (error) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			error: error.code || error.message,
			setupNeeded: "Verify PayPal server credentials and environment configuration."
		}, error.statusCode || 500);
	}
}

function failure(error) {
	return {
		BH: "B\"H",
		ok: false,
		error
	};
}

module.exports = {
	normalizeTopUpDollars,
	paypalCreate
};
