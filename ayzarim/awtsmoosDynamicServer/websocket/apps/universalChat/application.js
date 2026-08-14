// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { BinahChannelDirectory } = require("./channelDirectory.js");
const { handleHistoryRequest } = require("./historyHandlers.js");
const { handleMessageRequest } = require("./messageHandlers.js");
const { NetzachPresenceDirectory } = require("./presenceDirectory.js");
const { GevurahPresencePreference } = require("./presencePreference.js");
const { handlePresenceRequest } = require("./presenceHandlers.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { NetzachPublicMessageRepository } = require("./publicMessageRepository.js");
const { GevurahUniversalChatRateLimiter } = require("./rateLimiter.js");
const { GevurahSearchSessionLedger } = require("./searchSessionLedger.js");
const { handleSearchRequest } = require("./searchHandlers.js");

/**
 * @file Composes lightweight site presence, durable paged source discussion, and lazy Torah retrieval.
 * @description The Awtsmoos renews live presence in memory while public Torah teachings persist through canonical durable vessels of light;
 * Awtsmoos.com routes admission, history, search, and publication through separate handlers so each concern may deepen without swallowing the whole sight.
 */

/** Creates one universal-chat application with injectable search for focused tests. */
function createUniversalChatApplication(options = {}) {
	const presence = new NetzachPresenceDirectory();
	const channels = new BinahChannelDirectory();
	const sessions = new GevurahSearchSessionLedger(options.clock);
	const rate = new GevurahUniversalChatRateLimiter(options.clock);
	const searchGateway = options.searchGateway || lazyTorahSearch;
	let boundDatabase = null;
	let preference = null;
	let publicMessages = null;
	let lastSendEvent = null;

	function services(context) {
		const database = context.server?.db || null;
		if (boundDatabase !== database || !preference || !publicMessages) {
			boundDatabase = database;
			preference = new GevurahPresencePreference(database);
			publicMessages = new NetzachPublicMessageRepository(database);
		}
		return {
			presence,
			channels,
			sessions,
			rate,
			searchGateway,
			preference,
			publicMessages
		};
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		disconnect({ client }) {
			presence.disconnect(client);
			sessions.disconnect(client);
			rate.disconnect(client);
			if (lastSendEvent) {
				broadcastAfterDisconnect(presence, lastSendEvent);
			}
		},
		async handleVersioned(context, request) {
			lastSendEvent = context.sendEvent;
			const current = services(context);
			for (const handler of [
				handlePresenceRequest,
				handleHistoryRequest,
				handleSearchRequest,
				handleMessageRequest
			]) {
				const result = await handler(current, context, request);
				if (result) {
					return result;
				}
			}
			throw new RealtimeError(
				"UNIVERSAL_CHAT_REQUEST_UNKNOWN",
				`Unknown universal chat request: ${request.type}`,
				null,
				404
			);
		}
	};
}

/** Loads the existing Torah search stack only when someone submits private search intent. */
async function lazyTorahSearch(context, query) {
	const { searchTorahSources } = require("./sourceSearchGateway.js");
	return searchTorahSources(context, query);
}

/** Refreshes remaining public presence after one shared-socket disconnect. */
function broadcastAfterDisconnect(presence, sendEvent) {
	for (const client of presence.clients()) {
		const member = presence.require(client);
		sendEvent(client, "universalChat.presence", {
			presence: presence.snapshot(member.channel),
			roster: presence.roster(member.channel),
			hidden: member.hidden
		});
	}
}

module.exports = {
	createUniversalChatApplication
};
