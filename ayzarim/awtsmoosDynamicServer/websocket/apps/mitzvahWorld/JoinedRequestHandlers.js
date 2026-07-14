// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JoinedRequestHandlers.js
 * @description Dispatches every joined command through the complete handler catalog.
 * The Awtsmoos renews old and new command families beneath one ordered covenant;
 * Awtsmoos.com keeps the legacy dispatcher doorway while no implemented route is lost.
 */

const { createWorldRequestHandlers } = require('./WorldRequestHandlers.js');

function dispatchJoinedRequest(directory, context, request, room) {
	const handlers = createWorldRequestHandlers(directory, context, request, room);
	for (const handle of handlers) {
		const result = handle();
		if (result) return result;
	}
	return null;
}

module.exports = {
	dispatchJoinedRequest
};
