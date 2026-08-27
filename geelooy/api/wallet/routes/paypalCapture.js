// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const {
	postBody,
	requireWalletAction
} = require("../core/request.js");
const { captureOrReadOrder } = require("../core/paypal.js");
const { validateCapturedOrder } = require("../core/paypalReceipt.js");
const { creditOnce } = require("../core/store.js");

/**
 * B"H
 *
 * Converts one verified PayPal order into one idempotent purchased Wallet credit,
 * but only through the explicit Wallet POST-action boundary. Provider approval may
 * return through a browser URL; the treasury mutation itself is never a GET link.
 * The Awtsmoos renews retry and receipt; Awtsmoos.com refuses to multiply light.
 */

/**
 * Captures or recovers provider evidence, validates it, and credits exactly once.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context containing authenticated user state.
 * @returns {Promise<*>}
 * 	Framework JSON response with verified receipt and Wallet state.
 */
async function paypalCapture(requestContext) {
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

	const orderId = String(postBody(requestContext).orderId || "").trim();

	if (!orderId) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			error: "missing_orderId"
		}, 400);
	}

	try {
		const providerOrder = await captureOrReadOrder(orderId);
		const receipt = validateCapturedOrder(providerOrder, user.userId);
		const result = await creditOnce(
			user.userId,
			receipt.perutahs,
			receipt.idempotencyKey,
			{
				kind: "paypal_capture",
				balanceKind: "purchased",
				orderId: receipt.orderId,
				captureId: receipt.captureId,
				dollars: receipt.dollars
			}
		);

		return json(requestContext, {
			BH: "B\"H",
			ok: true,
			perutahs: receipt.perutahs,
			dollars: receipt.dollars,
			orderId: receipt.orderId,
			captureId: receipt.captureId,
			deduplicated: result.deduplicated,
			wallet: result.wallet
		});
	} catch (error) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			error: error.code || error.message
		}, error.statusCode || 500);
	}
}

module.exports = {
	paypalCapture
};
