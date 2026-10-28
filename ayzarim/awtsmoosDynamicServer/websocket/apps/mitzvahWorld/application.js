// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file application.js
 * The Awtsmoos renews each world behind one stable doorway;
 * Awtsmoos.com guards each player's steps when generations pass away.
 *
 * Realtime requests and expiry cleanup share one authoritative directory.
 * Default live servers use durable storage outside the Git checkout, while
 * deliberately injected directories retain the test caller's own custody.
 */

const { SessionExpiryScheduler } = require('./SessionExpiryScheduler.js');
const { createDefaultWorldDirectory } = require('./WorldPersistenceBootstrap.js');
const { dispatchWorldRequest } = require('./WorldRequestDispatcher.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require('./protocol.js');

/**
 * Prepare the authoritative game application without changing its public API.
 *
 * @param {object} [directory] Caller-owned world directory.
 * @param {object} [options] Expiry scheduler configuration.
 * @returns {object} Versioned socket application contract.
 */
function createMitzvahWorldApplication(directory = createDefaultWorldDirectory(), options = {}) {
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

/**
 * Attach one quiet-time cleanup clock per authoritative world directory.
 *
 * @param {object} directory Current world directory.
 * @param {object} options Optional scheduler or scheduler options.
 * @returns {object} Running expiry scheduler.
 */
function ensureScheduler(directory, options) {
	if (directory.expiryScheduler) {
		return directory.expiryScheduler;
	}
	const scheduler = options.scheduler || new SessionExpiryScheduler(
		directory,
		options.schedulerOptions
	);
	directory.expiryScheduler = scheduler.start();
	return directory.expiryScheduler;
}

/**
 * Preserve the established shared world's versioned command dispatch.
 *
 * @param {object} directory Authoritative world directory.
 * @param {object} context Authenticated transport context.
 * @param {object} request Versioned game request.
 * @returns {object} Authoritative command response.
 */
function handleMitzvahWorldRequest(directory, context, request) {
	return dispatchWorldRequest(directory, context, request);
}

module.exports = {
	createMitzvahWorldApplication,
	handleMitzvahWorldRequest
};
