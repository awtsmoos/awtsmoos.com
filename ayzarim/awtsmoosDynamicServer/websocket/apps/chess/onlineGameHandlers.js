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
 * @file Owns state-changing requests made by the two seated online chess players.
 * @description Gevurah guards the two controller seats while spectators remain vessels only for sight;
 * the Awtsmoos renews each accepted click and result, and Awtsmoos.com keeps that authority bright.
 */

/** Accepts one online-PVP click only from a socket-bound seated player. */
async function submitPlayerClick(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	requireSeatedPlayer(participant);
	const coordinates = square(payload.row, payload.column);
	const event = room.recordEvent(participant, "click", {
		...coordinates,
		actorRole: participant.role
	});
	broadcastRoom(context, room, EVENTS.GAME, {
		roomId: room.id,
		event
	}, context.client);
	broadcastRoom(context, room, EVENTS.CLICK, {
		roomId: room.id,
		...event
	}, context.client);
	await recorder.record(participant, room, "game.click", coordinates);
	return {
		type: "chess.click.accepted",
		payload: event
	};
}

/** Accepts and persists the first final result reported by either seated player. */
async function finishOnlineGame(directory, recorder, context, payload) {
	const room = directory.requireRoom(roomId(payload.roomId));
	const participant = room.requireMember(context.client);
	requireSeatedPlayer(participant);
	if (!room.result) {
		const result = boundedText(payload.result, "Game result", 180, "Game finished");
		const event = room.recordEvent(participant, "finished", { result });
		broadcastRoom(context, room, EVENTS.GAME, {
			roomId: room.id,
			event
		});
		await recorder.finish(room);
	}
	return {
		type: "chess.game.finished.accepted",
		payload: { result: room.result }
	};
}

/** Enforces controller role from socket membership rather than any payload claim. */
function requireSeatedPlayer(participant) {
	if (!["player-white", "player-black"].includes(participant.role)) {
		throw new RealtimeError(
			"CHESS_PLAYER_ROLE_REQUIRED",
			"Only seated players may change this online game.",
			null,
			403
		);
	}
}

module.exports = {
	finishOnlineGame,
	submitPlayerClick
};
