//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file application.js
 * @description Composes authenticated sessions, persistence, rooms, and combat.
 * The Awtsmoos renews transport and world as distinct vessels; Awtsmoos.com
 * delegates only this application's authenticated commands to its private laws.
 */

const { SharedRoadDirectory } = require('./SharedRoadDirectory.js');
const { GameTicketConsumer } = require('./auth/GameTicketConsumer.js');
const {
	AuthenticatedCharacterSession
} = require('./auth/AuthenticatedCharacterSession.js');
const { OhrHagnuzDispatcher } = require('./OhrHagnuzDispatcher.js');
const { broadcastRoom } = require('./RoadBroadcaster.js');
const {
	createCharacterRepositoryProvider
} = require('./persistence/CharacterRepositoryProvider.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require('./protocol.js');

function createOhrHagnuzApplication(options = {}) {
	const dependencies = options.dependencies || {};
	const directory = options.directory || new SharedRoadDirectory(dependencies);
	const repositoryProvider = options.repositoryProvider
		|| createCharacterRepositoryProvider();
	const ticketConsumer = options.ticketConsumer
		|| new GameTicketConsumer(dependencies);
	const sessions = new AuthenticatedCharacterSession({
		allowDevelopmentJoin: options.allowDevelopmentJoin,
		dependencies,
		directory,
		repositoryProvider,
		ticketConsumer
	});
	const dispatcher = new OhrHagnuzDispatcher(sessions);

	return {
		directory,
		dispatcher,
		id: APPLICATION_ID,
		legacyTypes: [],
		sessions,
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			const detached = sessions.leave(client);
			broadcastRoom(detached?.room);
			return detached;
		},
		handleVersioned(context, request) {
			return dispatcher.handle(context, request);
		}
	};
}

module.exports = { createOhrHagnuzApplication };
