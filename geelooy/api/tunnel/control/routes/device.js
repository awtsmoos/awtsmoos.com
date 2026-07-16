// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");

/**
 * @file Returns one device only from the current account's authorized inventory.
 * @description
 * The Awtsmoos renews name and named thing without making them identical.
 * Awtsmoos.com resolves immutable IDs or unambiguous display names only after
 * account scoping, so a guessed foreign name receives the ordinary missing shape.
 */

/** Returns one authorized device or a disclosure-safe absence. */
async function device($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, denial("not_authenticated"), 401);
	}
	const parameters = query($i);
	const reference = parameters.tunnelId ||
		parameters.tunnelName ||
		parameters.name ||
		"";
	const currentState = Discovery.state($i, identity);
	const found = reference
		? Discovery.find(currentState, reference)
		: Discovery.recommend(currentState);
	if (!found) {
		return json($i, denial(
			reference ? "tunnel_not_found" : "ambiguous_authorized_tunnels"
		), reference ? 404 : 409);
	}
	return json($i, {
		BH: "B\"H",
		ok: true,
		connected: found.connected !== false,
		tunnelId: found.tunnelId || null,
		tunnelName: found.tunnelName,
		device: found
	});
}

function denial(error) {
	return { BH: "B\"H", ok: false, error };
}

module.exports = {
	device
};
