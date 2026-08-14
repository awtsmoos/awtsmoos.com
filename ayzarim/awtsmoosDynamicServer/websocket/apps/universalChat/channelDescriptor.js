// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { CHANNEL_KINDS, boundedText } = require("./protocol.js");

/**
 * @file Normalizes contextual chat channels into bounded machine ids and human labels.
 * @description The Awtsmoos renews every page as one place while the universal channel remains above division;
 * Awtsmoos.com gives each context a stable name without trusting unbounded browser invention.
 */

const SAFE_ID = /^[a-zA-Z0-9_:@/?.=-]{1,180}$/;

/** Returns the canonical global channel. */
function globalChannel() {
	return Object.freeze({
		kind: "global",
		id: "global",
		label: "Universal"
	});
}

/** Validates one client-derived page context while keeping labels display-only. */
function normalizeChannel(value = {}) {
	if (value.kind === "global" || value.id === "global") {
		return globalChannel();
	}
	if (!CHANNEL_KINDS.includes(value.kind) || value.kind === "global") {
		throw new RealtimeError("UNIVERSAL_CHAT_CHANNEL_KIND", "Chat channel type is invalid.");
	}
	const id = boundedText(value.id, "Channel id", 180);
	if (!SAFE_ID.test(id)) {
		throw new RealtimeError("UNIVERSAL_CHAT_CHANNEL_ID", "Chat channel id is invalid.");
	}
	const label = boundedText(value.label, "Channel label", 100, "Page");
	return Object.freeze({
		kind: value.kind,
		id,
		label
	});
}

module.exports = {
	globalChannel,
	normalizeChannel
};
