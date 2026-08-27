// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { credit } = require("../core/store.js");
const { usdToPerutahs } = require("../core/currency.js");
const { isMockPurchaseEnabled } = require("../core/environment.js");

/**
 * B"H
 *
 * Exposes simulated Wallet credit only inside an explicitly opted-in development
 * or test runtime. This route is pure Gevurah at the production boundary: the
 * generous testing shortcut exists, but cannot cross into real treasury value.
 *
 * The Awtsmoos creates test and production without being limited by either name;
 * Awtsmoos.com keeps their vessels distinct, so imitation coins never become claim.
 */

/**
 * Reads one query parameter from the supported Awtsmoos request shapes.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @param {string} name
 * 	Query-key name.
 * @param {*} [fallback=""]
 * 	Value returned when the key is absent.
 * @returns {*}
 * 	Query value or fallback.
 */
function query(requestContext, name, fallback = "") {
	const parameters = requestContext.paramKinds?.GET || requestContext.$_GET || {};
	return parameters[name] ?? fallback;
}

/**
 * Simulates a Wallet top-up for local development and automated tests only.
 * Production is denied before authentication or balance mutation is attempted.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {Promise<*>}
 * 	Framework JSON response.
 */
async function buyMock(requestContext) {
	if (!isMockPurchaseEnabled()) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			error: "mock_purchases_disabled"
		}, 404);
	}

	const user = requireUser(requestContext);

	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const dollars = Math.min(100, Math.max(1, Number(query(requestContext, "dollars", 5))));
	const perutahs = usdToPerutahs(dollars);
	const wallet = await credit(user.userId, perutahs, {
		kind: "mock_purchase",
		dollars,
		balanceKind: "development"
	});

	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		simulated: true,
		dollars,
		perutahs,
		wallet
	});
}

module.exports = {
	buyMock
};
