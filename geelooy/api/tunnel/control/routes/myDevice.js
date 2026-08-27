// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");

/**
 * @file Selects one device only from the authenticated account's inventory.
 * @description
 * The Awtsmoos renews chooser and choice without permitting one soul to inherit
 * another's vessel. Awtsmoos.com returns the immutable route reference separately
 * from the friendly name and never recovers from globally connected relay clients.
 */
async function myDevice($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, response(false, "not_authenticated"), 401);
	}
	const parameters = query($i);
	const reference = requestedReference(parameters);
	const currentState = Discovery.state($i, identity);
	const selected = reference
		? Discovery.find(currentState, reference)
		: Discovery.recommend(currentState);
	if (!selected) {
		return json($i, {
			...Discovery.responseBase(currentState),
			...response(
				false,
				reference ? "tunnel_not_found" : "multiple_authorized_tunnels"
			),
			accountScope: identity.accountId
		}, reference ? 404 : 409);
	}
	const routeReference = selected.routeReference ||
		selected.tunnelId ||
		selected.tunnelName;
	return json($i, {
		...Discovery.responseBase(currentState),
		...response(true, ""),
		recovered: !reference,
		accountScope: identity.accountId,
		routeReference,
		tunnelId: selected.tunnelId || null,
		tunnelName: selected.tunnelName,
		connected: selected.connected !== false,
		device: selected,
		recommended: selected
	});
}

function requestedReference(parameters = {}) {
	return String(
		parameters.tunnelId ||
		parameters.routeReference ||
		parameters.tunnelName ||
		parameters.name ||
		""
	).trim();
}

function response(ok, error) {
	return {
		BH: "B\"H",
		ok,
		error: error || undefined
	};
}

module.exports = {
	myDevice,
	requestedReference
};
