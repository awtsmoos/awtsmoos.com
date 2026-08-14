// B"H
// Boruch Hashem
// Blessed is He

const { createMediaRelay } = require("./mediaSignaling.js");
const { EVENTS, TYPES, roomId } = require("./protocol.js");
const { broadcastRoom, sendParticipant } = require("./roomBroadcaster.js");
const { roomPresence } = require("./roomProjection.js");

/**
 * @file Routes public chess chat, media-presence state, and WebRTC signaling.
 * @description The Awtsmoos renews speech and peer connection through distinct streams of light;
 * Awtsmoos.com keeps video peer-to-peer while WebSockets carry only measured signals right.
 */

/** Handles chat/media requests and returns null when another handler family owns the type. */
async function handleChessSocialRequest(directory, recorder, context, request) {
	if (request.type === TYPES.CHAT) return sendChat(directory, recorder, context, request.payload);
	if (request.type === TYPES.MEDIA_STATE) return setMediaState(directory, recorder, context, request.payload);
	if (request.type === TYPES.MEDIA_SIGNAL) return relayMediaSignal(directory, recorder, context, request.payload);
	return null;
}

/** Sends one validated public message to every attached role in the room. */
async function sendChat(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	const message = room.chat.send(participant, payload.message);
	broadcastRoom(context, room, EVENTS.CHAT, { roomId: room.id, message });
	await recorder.record(participant, room, "chat.sent", { message: message.message });
	return { type: "chess.chat.sent", payload: message };
}

/** Changes only the caller's media-presence flag; it never opens camera hardware server-side. */
async function setMediaState(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	participant.mediaEnabled = payload.enabled === true;
	const presence = roomPresence(room);
	broadcastRoom(context, room, EVENTS.PRESENCE, { roomId: room.id, presence });
	await recorder.record(participant, room, participant.mediaEnabled ? "media.enabled" : "media.disabled");
	return {
		type: "chess.media.state.accepted",
		payload: { enabled: participant.mediaEnabled, peerId: participant.peerId, presence }
	};
}

/** Routes bounded offer/answer/ICE data only to a connected peer in the same room. */
async function relayMediaSignal(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	const relay = createMediaRelay(room, participant, String(payload.targetPeerId || ""), payload.signal);
	sendParticipant(context, relay.target, EVENTS.MEDIA_SIGNAL, relay.payload);
	await recorder.record(participant, room, "media.signal", {
		kind: relay.payload.signal.kind,
		targetPeerId: relay.target.peerId
	});
	return {
		type: "chess.media.signal.accepted",
		payload: { targetPeerId: relay.target.peerId, kind: relay.payload.signal.kind }
	};
}

module.exports = { handleChessSocialRequest };
