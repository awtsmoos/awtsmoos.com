//B"H
// Boruch Hashem
// Blessed is He

const Id = require("../tunnelSecurity/identifiers.js");
const Secrets = require("../tunnelSecurity/secrets.js");
const Capabilities = require("./capabilities.js");
const Limits = require("./limits.js");

/**
 * @file Builds server-stamped bounded envelopes for the Awtsmoos Device Protocol.
 * @description
 * The Awtsmoos creates sender, receiver, word, and moment together; Awtsmoos.com
 * therefore lets clients provide content but never forge identity or authority.
 * Kind selects one finite capability while payload and metadata stay bounded in rhyme.
 */

const PROTOCOL = "awtsmoos-device";
const VERSION = 1;
const KIND_CAPABILITY = Object.freeze({
	message: Capabilities.DEVICE_PROTOCOL_CAPABILITY.MESSAGE_SEND,
	event: Capabilities.DEVICE_PROTOCOL_CAPABILITY.EVENT_SEND,
	request: Capabilities.DEVICE_PROTOCOL_CAPABILITY.REQUEST_SEND
});

/** Returns the exact capability required by one message kind. */
function capabilityForKind(kind) {
	return KIND_CAPABILITY[String(kind || "").trim().toLowerCase()] || "";
}

/** Validates client-controlled message content before relationship authorization. */
function validateInput(input = {}) {
	const kind = String(input.kind || "").trim().toLowerCase();
	const capability = capabilityForKind(kind);
	const topic = Limits.topic(input.topic);
	const bytes = Limits.payloadBytes(input.payload);
	if (!capability || bytes > Limits.LIMIT.MAX_PAYLOAD_BYTES) {
		return { ok: false, error: "device_protocol_message_invalid" };
	}
	if (input.topic && !topic) {
		return { ok: false, error: "device_protocol_topic_invalid" };
	}
	return { ok: true, kind, capability, topic };
}

/** Builds an immutable server-owned envelope after authorization is proven. */
function create(relationship, input, sequence) {
	const validation = validateInput(input);
	if (!validation.ok) {
		return validation;
	}
	const messageId = `msg_${Secrets.randomToken(18)}`;
	return {
		ok: true,
		message: Object.freeze({
			protocol: PROTOCOL,
			version: VERSION,
			messageId,
			relationshipId: relationship.relationshipId,
			sourceAccountId: relationship.sourceAccountId,
			sourceDeviceId: relationship.sourceDeviceId,
			targetAccountId: relationship.targetAccountId,
			targetDeviceId: relationship.targetDeviceId,
			capability: validation.capability,
			kind: validation.kind,
			topic: validation.topic,
			replyTo: Id.normalizeIdentifier(input.replyTo),
			payload: input.payload,
			createdAt: new Date().toISOString(),
			expiresAt: Limits.expiresAt(
				input.ttlMs,
				Limits.LIMIT.MESSAGE_DEFAULT_TTL_MS,
				Limits.LIMIT.MESSAGE_MAX_TTL_MS
			),
			sequence
		})
	};
}

module.exports = {
	PROTOCOL,
	VERSION,
	capabilityForKind,
	create,
	validateInput
};
