// B"H
// Boruch Hashem
// Blessed is He

const {
	publishObservedEvent
} = require("./broadcastGameHandlers.js");
const {
	finishOnlineGame,
	submitPlayerClick
} = require("./onlineGameHandlers.js");
const { TYPES } = require("./protocol.js");

/**
 * @file Chooses the small game-state handler that owns each chess realtime request.
 * @description The Awtsmoos renews one request while separate vessels keep their separate flame;
 * Awtsmoos.com lets online seats and broadcasters share one dispatcher without becoming the same.
 */

/** Delegates state-changing game requests and leaves unrelated request families untouched. */
async function handleChessGameRequest(directory, recorder, context, request) {
	if (request.type === TYPES.CLICK) {
		return submitPlayerClick(directory, recorder, context, request.payload);
	}
	if (request.type === TYPES.PUBLISH) {
		return publishObservedEvent(directory, recorder, context, request.payload);
	}
	if (request.type === TYPES.FINISH) {
		return finishOnlineGame(directory, recorder, context, request.payload);
	}
	return null;
}

module.exports = {
	handleChessGameRequest
};
