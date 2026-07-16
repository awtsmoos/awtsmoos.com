// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");

/**
 * @file Selects the current account's requested or recommended authorized device.
 * @description
 * The Awtsmoos renews chooser and choice without permitting one soul to inherit
 * another's vessel. Awtsmoos.com recovers only from this account's inventory and
 * never from the number of globally connected relay clients.
 */

/** Returns one account-bound device selection for the control panel. */
async function myDevice($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, response(false, "not_authenticated"), 401);
	}
	const parameters = query($i);
	const reference = parameters.tunnelId ||
		parameters.tunnelName ||
		parameters.name ||
		"";
	const currentState = Discovery.state($i, identity);
	const selected = reference
		? Discovery.find(currentState, reference)
		: Discovery.recommend(currentState);
	if (!selected) {
		return json($i, {
			...Discovery.responseBase(currentState),
			...response(false, reference
				? "tunnel_not_found"
				: "multiple_authorized_tunnels")
		}, reference ? 404 : 409);
	}
	return json($i, {
		...Discovery.responseBase(currentState),
		...response(true, ""),
		recovered: !reference,
		tunnelId: selected.tunnelId || null,
		tunnelName: selected.tunnelName,
		connected: selected.connected !== false,
		device: selected,
		recommended: selected
	});
}

function response(ok, error) {
	return { BH: "B\"H", ok, error: error || undefined };
}

module.exports = {
	myDevice
};
