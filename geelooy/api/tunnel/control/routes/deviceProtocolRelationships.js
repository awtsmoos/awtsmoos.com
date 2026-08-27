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
 * directional covenant visible to its two people, labels direction from authenticated
 * truth, lets either side revoke, and reveals presence only through accepted light in rhyme.
 */

async function list($i) {
	const auth = Support.identity($i);
	if (!auth.ok) {
		return auth.response;
	}
	const accountId = auth.identity.accountId;
	const relationships = Relationships.forAccount(accountId)
		.map(relationship => withDirection(relationship, accountId));
	return json($i, {
		BH: "B\"H",
		ok: true,
		relationships
	});
}

async function capabilities($i) {
	const auth = Support.identity($i);
	if (!auth.ok) {
		return auth.response;
	}
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
	if (!auth.ok) {
		return auth.response;
	}
	const input = await body($i);
	const relationship = Relationships.revoke(
		auth.identity.accountId,
		input.relationshipId
	);
	if (!relationship) {
		return json(
			$i,
			Support.denial("device_protocol_relationship_not_found"),
			404
		);
	}
	return json($i, {
		BH: "B\"H",
		ok: true,
		relationship: withDirection(relationship, auth.identity.accountId)
	});
}

async function presence($i) {
	const auth = Support.identity($i);
	if (!auth.ok) {
		return auth.response;
	}
	const relationship = Relationships.authorize(
		auth.identity.accountId,
		query($i).relationshipId,
		Capabilities.DEVICE_PROTOCOL_CAPABILITY.PRESENCE_READ
	);
	if (!relationship) {
		return json(
			$i,
			Support.denial("device_protocol_relationship_not_found"),
			404
		);
	}
	return json($i, {
		BH: "B\"H",
		ok: true,
		presence: Presence.observe($i, relationship)
	});
}

function withDirection(relationship, accountId) {
	return {
		...relationship,
		direction: relationship.sourceAccountId === accountId
			? "outgoing"
			: "incoming"
	};
}

module.exports = {
	capabilities,
	list,
	presence,
	revoke
};
