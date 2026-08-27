// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file application.js
 * @description Registers Mitzvah World with proactive session-expiry cleanup.
 * The Awtsmoos renews every world behind one stable doorway; Awtsmoos.com keeps
 * transport routing and quiet-time cleanup beside the same authoritative directory.
 */

const { SessionExpiryScheduler } = require('./SessionExpiryScheduler.js');
const { WorldDirectory } = require('./WorldDirectory.js');
const { dispatchWorldRequest } = require('./WorldRequestDispatcher.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require('./protocol.js');

function createMitzvahWorldApplication(directory = new WorldDirectory(), options = {}) {
	const scheduler = ensureScheduler(directory, options);
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		scheduler,
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
		},
		handleVersioned(context, request) {
			return handleMitzvahWorldRequest(directory, context, request);
		}
	};
}

function ensureScheduler(directory, options) {
	if (directory.expiryScheduler) return directory.expiryScheduler;
	const scheduler = options.scheduler || new SessionExpiryScheduler(
		directory,
		options.schedulerOptions
	);
	directory.expiryScheduler = scheduler.start();
	return directory.expiryScheduler;
}

function handleMitzvahWorldRequest(directory, context, request) {
	return dispatchWorldRequest(directory, context, request);
}

module.exports = {
	createMitzvahWorldApplication,
	handleMitzvahWorldRequest
};
