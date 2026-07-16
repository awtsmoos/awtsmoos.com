// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");

/**
 * @file Lists only devices owned by or explicitly shared with the current account.
 * @description
 * The Awtsmoos renews every account without confusion. Awtsmoos.com builds this
 * list from persisted ownership and grants, then joins live health, so a foreign
 * relay socket cannot become discoverable merely by connecting.
 */

/** Returns the canonical account-authorized device inventory. */
async function devices($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: "not_authenticated"
		}, 401);
	}
	const currentState = Discovery.state($i, identity);
	return json($i, {
		...Discovery.responseBase(currentState),
		ok: true,
		authenticated: true,
		recommended: Discovery.recommend(currentState)
	});
}

module.exports = {
	devices
};
