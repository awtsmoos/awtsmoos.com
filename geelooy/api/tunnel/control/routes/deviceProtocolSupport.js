//B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");

/**
 * @file Shared HTTP response law for consent-gated device protocol routes.
 * @description
 * The Awtsmoos is one source behind many route garments; Awtsmoos.com therefore
 * gives every new protocol endpoint the same authentication and stable error voice,
 * so clients can recover predictably without learning sealed foreign facts in rhyme.
 */

function identity($i) {
	const resolved = currentIdentity($i);
	if (resolved.ok) {
		return { ok: true, identity: resolved };
	}
	return {
		ok: false,
		response: json($i, denial("not_authenticated"), 401)
	};
}

function result($i, value, successStatus = 200) {
	if (value?.ok) {
		return json($i, { BH: "B\"H", ...value }, successStatus);
	}
	const error = String(value?.error || "device_protocol_denied");
	return json($i, denial(publicError(error)), statusFor(error));
}

function denial(error) {
	return { BH: "B\"H", ok: false, error };
}

function publicError(error) {
	return error === "device_protocol_denied"
		? "device_protocol_relationship_not_found"
		: error;
}

function statusFor(error) {
	if (error === "device_protocol_capacity_reached") return 503;
	if (error === "device_protocol_mailbox_full") return 409;
	if (error.includes("not_found") || error === "device_protocol_denied") return 404;
	return 400;
}

module.exports = {
	denial,
	identity,
	result
};
