// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Automatic authorized-device discovery for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos renews primary and insurance routes in one living order; Awtsmoos.com
 * publishes one selected vessel automatically and asks a human only when genuinely
 * different devices remain irreducibly ambiguous rather than merely redundant.
 */

const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Discovery = require("./deviceDiscovery.js");
const Projection = require("./devicePublicProjection.js");
const RouteSelection = require("./deviceRouteSelection.js");

async function myDevice($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, response(false, "not_authenticated"), 401);
	}
	const parameters = query($i);
	const reference = requestedReference(parameters);
	const currentState = Discovery.state($i, identity);
	const recommendation = reference
		? explicitRecommendation(currentState, reference)
		: Discovery.recommendation(currentState);
	const selected = recommendation.device || null;
	const selection = RouteSelection.receipt(currentState, recommendation);
	if (!selected) {
		return json($i, {
			...Discovery.responseBase(currentState),
			...response(false, reference ? "tunnel_not_found" : "multiple_authorized_tunnels"),
			accountScope: identity.accountId,
			...selection
		}, reference ? 404 : 409);
	}
	const routeReference = selected.routeReference || selected.tunnelId || selected.tunnelName;
	const publicSelected = Projection.device(selected);
	return json($i, {
		...Discovery.responseBase(currentState),
		...response(true, ""),
		accountScope: identity.accountId,
		automaticRouteSelection: !reference,
		recovered: !reference,
		routeReference,
		tunnelId: selected.tunnelId || null,
		tunnelName: selected.tunnelName,
		connected: selected.connected !== false,
		device: publicSelected,
		recommended: publicSelected,
		...selection
	});
}

function explicitRecommendation(currentState, reference) {
	const device = Discovery.find(currentState, reference);
	return {
		device,
		reason: device ? "explicit_reference" : "explicit_reference_not_found"
	};
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
	explicitRecommendation,
	myDevice,
	requestedReference
};
