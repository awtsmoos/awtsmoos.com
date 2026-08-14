// B"H
// Boruch Hashem
// Blessed is He

const { usdToPerutahs } = require("./currency.js");
const { paypalFetch } = require("./paypalTransport.js");

/**
 * B"H
 *
 * Owns PayPal order semantics while validated transport and environment remain in
 * smaller vessels. The Awtsmoos renews order, approval, retry, and receipt in one
 * source; Awtsmoos.com treats provider replays as evidence to inspect, never as
 * permission to create a second stream of value from the same completed capture.
 */

/**
 * Creates one PayPal top-up order bound to account and canonical Perutah amount.
 *
 * @param {{dollars: number, userId: string, returnUrl: string, cancelUrl: string}} input
 * 	Validated order inputs.
 * @returns {Promise<object>}
 * 	Provider order response.
 */
async function createOrder({ dollars, userId, returnUrl, cancelUrl }) {
	const amount = Number(dollars).toFixed(2);
	const perutahs = usdToPerutahs(amount);

	return paypalFetch("/v2/checkout/orders", {
		method: "POST",
		body: JSON.stringify({
			intent: "CAPTURE",
			purchase_units: [{
				custom_id: `${userId}:${perutahs}`,
				description: "Awtsmoos Perutah Wallet Top-Up",
				amount: {
					currency_code: "USD",
					value: amount
				}
			}],
			application_context: {
				brand_name: "Awtsmoos",
				landing_page: "LOGIN",
				user_action: "PAY_NOW",
				return_url: returnUrl,
				cancel_url: cancelUrl
			}
		})
	});
}

/**
 * Reads one PayPal order including any existing capture evidence.
 *
 * @param {string} orderId
 * 	Provider order identifier.
 * @returns {Promise<object>}
 * 	Current provider order state.
 */
async function getOrder(orderId) {
	return paypalFetch(
		`/v2/checkout/orders/${encodeURIComponent(orderId)}`,
		{ method: "GET" }
	);
}

/**
 * Attempts capture, then reads provider state when capture itself errors. An
 * already-completed provider payment can therefore re-enter the local idempotent
 * credit path after a lost response without performing a second provider capture.
 *
 * @param {string} orderId
 * 	Provider order identifier.
 * @returns {Promise<object>}
 * 	Fresh capture response or already-completed order state.
 */
async function captureOrReadOrder(orderId) {
	try {
		return await paypalFetch(
			`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
			{
				method: "POST",
				headers: {
					"PayPal-Request-Id": `awtsmoos-wallet-capture-${orderId}`
				},
				body: "{}"
			}
		);
	} catch (captureError) {
		const existingOrder = await getOrder(orderId);

		if (existingOrder?.status === "COMPLETED") {
			return existingOrder;
		}

		throw captureError;
	}
}

module.exports = {
	createOrder,
	getOrder,
	captureOrReadOrder
};
