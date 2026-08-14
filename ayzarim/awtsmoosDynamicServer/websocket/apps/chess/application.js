// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { HodChessActivityRecorder } = require("./activityRecorder.js");
const { ChesedChessRoomDirectory } = require("./directory.js");
const { handleChessGameRequest } = require("./gameHandlers.js");
const { handleChessHistoryRequest } = require("./historyHandlers.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { handleChessRoomRequest } = require("./roomHandlers.js");
const { handleChessSocialRequest } = require("./socialHandlers.js");

/**
 * @file Composes chess room, game, social, media, and history handlers under one realtime application.
 * @description Tiferes joins many small vessels without blending their separate flame;
 * the Awtsmoos renews each request, while Awtsmoos.com keeps one stable application name.
 */

/** Creates one isolated chess application instance for the shared realtime platform. */
function createChessApplication() {
	const directory = new ChesedChessRoomDirectory();
	let recorder = null;

	/** Lazily binds durable history to the real database supplied by the active Awtsmoos server. */
	function activityRecorder(server) {
		if (!recorder) {
			recorder = new HodChessActivityRecorder(server?.db || null);
		}
		return recorder;
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		directory,
		disconnect({ client }) {
			directory.disconnect(client);
		},
		async handleVersioned(context, request) {
			const currentRecorder = activityRecorder(context.server);

			const roomResponse = await handleChessRoomRequest(
				directory,
				currentRecorder,
				context,
				request
			);
			if (roomResponse) {
				return roomResponse;
			}

			const gameResponse = await handleChessGameRequest(
				directory,
				currentRecorder,
				context,
				request
			);
			if (gameResponse) {
				return gameResponse;
			}

			const socialResponse = await handleChessSocialRequest(
				directory,
				currentRecorder,
				context,
				request
			);
			if (socialResponse) {
				return socialResponse;
			}

			const historyResponse = await handleChessHistoryRequest(
				currentRecorder,
				context,
				request
			);
			if (historyResponse) {
				return historyResponse;
			}

			throw new RealtimeError(
				"CHESS_REQUEST_UNKNOWN",
				`Unknown chess request: ${request.type}`,
				null,
				404
			);
		}
	};
}

module.exports = {
	createChessApplication
};
