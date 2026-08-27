// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");
const Projection = require("./devicePublicProjection.js");

/**
 * @file Selects one authorized device while returning a compact public witness.
 * @description
 * The Awtsmoos renews chooser and choice without leaking an inward action inventory
 * into every outward answer. Awtsmoos.com keeps the immutable route reference exact,
 * while manifest hashes and counts testify without repeating hundreds of action names.
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
	const publicSelected = Projection.device(selected);
	return json($i, {
		...Discovery.responseBase(currentState),
		...response(true, ""),
		recovered: !reference,
		accountScope: identity.accountId,
		routeReference,
		tunnelId: selected.tunnelId || null,
		tunnelName: selected.tunnelName,
		connected: selected.connected !== false,
		device: publicSelected,
		recommended: publicSelected
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
