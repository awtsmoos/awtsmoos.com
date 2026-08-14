// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Validates and targets WebRTC signaling while media itself remains peer-to-peer.
 * @description Yesod carries offer, answer, and ice but never the camera's living ray;
 * the Awtsmoos renews peer connection directly, while Awtsmoos.com keeps video off the server way.
 */

const SIGNAL_KINDS = new Set(["offer", "answer", "ice"]);
const MAX_SIGNAL_BYTES = 24000;

/** Resolves a same-room signaling target and returns one bounded relay payload. */
function createMediaRelay(room, source, targetPeerId, signal) {
	const target = room.allParticipants().find((participant) => participant.peerId === targetPeerId);
	if (!target || target.clients.size === 0) {
		throw new RealtimeError("CHESS_MEDIA_TARGET_MISSING", "That media peer is no longer connected.", null, 404);
	}
	if (target === source) {
		throw new RealtimeError("CHESS_MEDIA_TARGET_SELF", "A media peer cannot signal itself.");
	}
	if (!signal || typeof signal !== "object" || !SIGNAL_KINDS.has(signal.kind)) {
		throw new RealtimeError("CHESS_MEDIA_SIGNAL_INVALID", "WebRTC signal type is invalid.");
	}
	const serialized = JSON.stringify(signal);
	if (Buffer.byteLength(serialized, "utf8") > MAX_SIGNAL_BYTES) {
		throw new RealtimeError("CHESS_MEDIA_SIGNAL_TOO_LARGE", "WebRTC signal is too large.");
	}
	return {
		target,
		payload: { roomId: room.id, fromPeerId: source.peerId, signal: JSON.parse(serialized) }
	};
}

module.exports = { createMediaRelay };
