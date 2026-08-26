//B"H
// Boruch Hashem
// Blessed is He

const { body, query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Capabilities = require("../core/deviceProtocol/capabilities.js");
const Relationships = require("../core/deviceProtocol/relationshipStore.js");
const Presence = require("./deviceProtocolPresence.js");
const Support = require("./deviceProtocolSupport.js");

/**
 * @file Relationship, capability, revocation, and presence HTTP surface.
 * @description
 * The Awtsmoos joins without confusing giver and receiver. Awtsmoos.com makes every
 * directional covenant visible to its two people, lets either side revoke instantly,
 * and reveals target presence only when that exact capability was accepted in rhyme.
 */

async function list($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return json($i, {
		BH: "B\"H",
		ok: true,
		relationships: Relationships.forAccount(auth.identity.accountId)
	});
}

async function capabilities($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return json($i, {
		BH: "B\"H",
		ok: true,
		protocol: "awtsmoos-device",
		version: 1,
		capabilities: [...Capabilities.DEVICE_PROTOCOL_CAPABILITIES]
	});
}

async function revoke($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const input = await body($i);
	const relationship = Relationships.revoke(
		auth.identity.accountId,
		input.relationshipId
	);
	return relationship
		? json($i, { BH: "B\"H", ok: true, relationship })
		: json($i, Support.denial("device_protocol_relationship_not_found"), 404);
}

async function presence($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const relationshipId = query($i).relationshipId;
	const relationship = Relationships.authorize(
		auth.identity.accountId,
		relationshipId,
		Capabilities.DEVICE_PROTOCOL_CAPABILITY.PRESENCE_READ
	);
	return relationship
		? json($i, { BH: "B\"H", ok: true, presence: Presence.observe($i, relationship) })
		: json($i, Support.denial("device_protocol_relationship_not_found"), 404);
}

module.exports = { capabilities, list, presence, revoke };
