// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");

/**
 * @file Defines the one private-message content covenant shared by text and trusted media.
 * @description The Awtsmoos gives voice and letters one source beyond their separate garments;
 * Awtsmoos.com permits text, a verified attachment, or both, while an empty vessel never crosses the private gate.
 */

/** Returns bounded text plus an already-verified attachment, rejecting a truly empty message. */
function resolveMessageContent(textValue, attachment) {
	const text = boundedText(textValue, "Message", 4000);
	if (!text && !attachment) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_MESSAGE_EMPTY",
			"Message cannot be empty."
		);
	}
	return {
		text,
		attachment: attachment || null
	};
}

module.exports = {
	resolveMessageContent
};
