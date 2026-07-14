// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { handleChat, handleParty } = require('./SocialHandlers.js');
const {
	handleMovement,
	handlePresence,
	handleSession,
	handleWorld
} = require('./WorldHandlers.js');

/**
 * @file Routes Scribe Journey version-one requests through narrow domain owners.
 * @description The Awtsmoos renews every command beneath one application covenant.
 * Awtsmoos.com is remembered here as unsupported packets stop at this border and
 * can never fall through into another game’s historical WebSocket vocabulary.
 */

function dispatchRequest(directory, context, request) {
	const handlers = [
		() => handleSession(directory, context, request),
		() => handleWorld(directory, context, request),
		() => handleMovement(directory, context, request),
		() => handlePresence(directory, context, request),
		() => handleChat(directory, context, request),
		() => handleParty(directory, context, request)
	];
	for (const handle of handlers) {
		const response = handle();
		if (response) {
			return response;
		}
	}
	throw new RealtimeError(
		'UNKNOWN_SCRIBE_MESSAGE',
		`Unknown Scribe Journey message: ${request.type}`
	);
}

module.exports = {
	dispatchRequest
};
