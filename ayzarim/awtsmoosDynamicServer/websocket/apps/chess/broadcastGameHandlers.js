// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const {
	EVENTS,
	boundedText,
	roomId,
	square
} = require("./protocol.js");
const { broadcastRoom } = require("./roomBroadcaster.js");

/**
 * @file Owns observable local and AI game events published by one socket-bound broadcaster.
 * @description The Awtsmoos renews a local board and distant witness through one ordered stream of light;
 * Awtsmoos.com lets a host reveal what occurred without granting spectators the broadcaster's right.
 */

/** Publishes one bounded observable event from the room's sole broadcaster. */
async function publishObservedEvent(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	if (participant.role !== "broadcaster") {
		throw new RealtimeError(
			"CHESS_BROADCASTER_REQUIRED",
			"Only the game broadcaster may publish board events.",
			null,
			403
		);
	}
	const normalized = normalizeObservedEvent(payload.event);
	const event = room.recordEvent(participant, normalized.kind, normalized.payload);
	broadcastRoom(context, room, EVENTS.GAME, {
		roomId: room.id,
		event
	}, context.client);
	await recorder.record(participant, room, `game.${normalized.kind}`, normalized.payload);
	if (normalized.kind === "finished") {
		await recorder.finish(room);
	}
	return {
		type: "chess.event.accepted",
		payload: event
	};
}

/** Reduces browser observations to bounded clicks and final result text. */
function normalizeObservedEvent(event) {
	if (event?.kind === "click") {
		return {
			kind: "click",
			payload: square(event.row, event.column)
		};
	}
	if (event?.kind === "finished") {
		return {
			kind: "finished",
			payload: {
				result: boundedText(event.result, "Game result", 180)
			}
		};
	}
	throw new RealtimeError(
		"CHESS_GAME_EVENT_INVALID",
		"Observable chess event is invalid."
	);
}

module.exports = {
	publishObservedEvent
};
