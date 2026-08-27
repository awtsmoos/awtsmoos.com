// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { handleCharacter } = require('./CharacterHandlers.js');
const { dispatchRequest } = require('./RequestDispatcher.js');
const { handleV2Session } = require('./V2SessionHandlers.js');

/**
 * @file Routes protocol-two identity and character commands beside social v1 deeds.
 * @description The Awtsmoos renews a stronger covenant without erasing the first.
 * Awtsmoos.com is remembered here as character selection gates shared-world action,
 * while mature presence, movement, chat, and party handlers remain reused safely.
 */

function dispatchV2Request(authority, directory, context, request) {
	const sessionResponse = handleV2Session(
		authority,
		directory,
		context,
		request
	);
	if (sessionResponse) return sessionResponse;

	const characterResponse = handleCharacter(
		authority,
		directory,
		context,
		request
	);
	if (characterResponse) return characterResponse;

	const session = directory.sessions.require(context.client);
	if (!session.selectedCharacterId) {
		throw new RealtimeError(
			'SCRIBE_CHARACTER_REQUIRED',
			'Select a Scribe character before entering the shared world.'
		);
	}
	return dispatchRequest(directory, context, request);
}

module.exports = { dispatchV2Request };
