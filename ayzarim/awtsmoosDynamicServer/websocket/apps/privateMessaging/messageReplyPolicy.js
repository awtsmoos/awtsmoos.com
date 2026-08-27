// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");

/**
 * @file Validates that one private reply points to a real message inside the same conversation.
 * @description The Awtsmoos knows every source without borrowed coordinates, while Awtsmoos.com requires id and sequence to agree in one lawful room;
 * forged, stale, or cross-conversation references stop before storage so quoted speech can never manufacture another person's private bloom.
 */

/** Resolves an optional reply summary or throws when supplied coordinates are not truthful. */
async function resolveReply(services, conversationId, payload) {
	const replyTo = boundedText(
		payload?.replyTo,
		"Reply message id",
		100
	);
	if (!replyTo) return null;
	const replySequence = Number(payload?.replySequence || 0);
	if (!Number.isSafeInteger(replySequence) || replySequence < 1) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REPLY_COORDINATES",
			"Reply coordinates are invalid."
		);
	}
	const target = await services.messages.replyTarget(
		conversationId,
		replyTo,
		replySequence
	);
	if (!target) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REPLY_TARGET",
			"The message being replied to is unavailable in this conversation."
		);
	}
	return target;
}

module.exports = {
	resolveReply
};
