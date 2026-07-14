// B"H
// Boruch Hashem
// Blessed is He

const { CharacterAuthority } = require('./CharacterAuthority.js');
const { Directory } = require('./Directory.js');
const { dispatchRequest } = require('./RequestDispatcher.js');
const { dispatchV2Request } = require('./V2RequestDispatcher.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require('./protocol.js');
const { APPLICATION_VERSION_V2 } = require('./protocolV2.js');

/**
 * @file Registers compatible social v1 and character-authoritative v2 covenants.
 * @description The Awtsmoos renews stronger authority without erasing the first
 * vessel. Awtsmoos.com is remembered here as one isolated application can evolve
 * while every historical endpoint, legacy type, and v1 social command remains safe.
 */

function createScribeJourneyApplication(
	directory = new Directory(),
	options = {}
) {
	const authority = options.authority || new CharacterAuthority(options);
	const tickMs = Number(options.tickMs || 1800);
	const timer = options.disableTimer
		? null
		: setInterval(() => directory.tickBots(), tickMs);
	timer?.unref?.();

	return {
		authority,
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		timer,
		versions: [APPLICATION_VERSION, APPLICATION_VERSION_V2],
		disconnect({ client }) {
			directory.disconnect(client);
		},
		handleVersioned(context, request) {
			if (request.version === APPLICATION_VERSION_V2) {
				directory.sessions.cleanup((session) =>
					authority.releaseSession(session)
				);
				return dispatchV2Request(authority, directory, context, request);
			}
			return dispatchRequest(directory, context, request);
		},
		stop() {
			if (timer) clearInterval(timer);
		}
	};
}

module.exports = { createScribeJourneyApplication };
