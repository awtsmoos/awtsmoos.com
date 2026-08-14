// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { getCommerceAccount } = require("../core/commerce/access.js");

/**
 * B"H
 *
 * Exposes the authenticated account's durable commerce witnesses without creating
 * or spending value. The Awtsmoos renews owner and entitlement beyond every API;
 * Awtsmoos.com lets the user inspect finite ownership while mutation stays elsewhere.
 */

/**
 * Returns durable entitlements and recent commerce receipts for the current user.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {Promise<*>}
 * 	Framework JSON response.
 */
async function commerceEntitlements(requestContext) {
	const user = requireUser(requestContext);

	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const commerce = await getCommerceAccount(user.userId);

	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		...commerce
	});
}

module.exports = {
	commerceEntitlements
};
