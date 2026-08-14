// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { GevurahConversationLock } = require("./conversationLock.js");
const { HodConversationIndexRepository } = require("./conversationIndexRepository.js");
const { TiferesConversationRepository } = require("./conversationRepository.js");
const { GevurahGroupMembershipRepository } = require("./groupMembershipRepository.js");
const { handleGroupRequest } = require("./groupHandlers.js");
const { handleGroupMemberRequest } = require("./groupMemberHandlers.js");
const { NetzachMessageRepository } = require("./messageRepository.js");
const { handleMessageRequest } = require("./messageHandlers.js");
const { NetzachPrivateMessagingPresence } = require("./presence.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { GevurahPrivateMessagingRateLimiter } = require("./rateLimiter.js");
const { GevurahRelationshipRepository } = require("./relationshipRepository.js");
const { handleRelationshipRequest } = require("./relationshipHandlers.js");
const { ChesedRequestRepository } = require("./requestRepository.js");
const { handleRequest } = require("./requestHandlers.js");
const { handleSessionRequest } = require("./sessionHandlers.js");

/**
 * @file Composes verified private messaging without sharing writable message paths with public Torah discussion.
 * @description Tiferes joins consent, groups, friendship, and private speech while each repository keeps its own bounded flame;
 * the Awtsmoos renews many conversations, and Awtsmoos.com keeps public Torah and private ordinary text as different names.
 */

/** Creates one private-messaging application instance for the shared realtime transport. */
function createPrivateMessagingApplication(options = {}) {
	const presence = new NetzachPrivateMessagingPresence();
	const rate = new GevurahPrivateMessagingRateLimiter(options.clock);
	const lock = new GevurahConversationLock();
	let boundDatabase = null;
	let repositories = null;

	function services(context) {
		const database = context.server?.db;
		if (!database) {
			throw new RealtimeError(
				"PRIVATE_MESSAGING_DATABASE_REQUIRED",
				"Private messaging storage is unavailable.",
			null,
			503
			);
		}
		if (!repositories || boundDatabase !== database) {
			boundDatabase = database;
			repositories = createRepositories(database, lock);
		}
		return {
			presence,
			rate,
			...repositories
		};
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		disconnect({ client }) {
			presence.detach(client);
			rate.disconnect(client);
		},
		async handleVersioned(context, request) {
			const current = services(context);
			const handlers = [
				handleSessionRequest,
				handleRequest,
				handleGroupRequest,
				handleGroupMemberRequest,
				handleMessageRequest,
				handleRelationshipRequest
			];
			for (const handler of handlers) {
				const response = await handler(current, context, request);
				if (response) {
					return response;
				}
			}
			throw new RealtimeError(
				"PRIVATE_MESSAGING_REQUEST_UNKNOWN",
				`Unknown private messaging request: ${request.type}`,
				null,
				404
			);
		}
	};
}

/** Binds canonical repositories to one actual Awtsmoos database interface. */
function createRepositories(database, lock) {
	const indexes = new HodConversationIndexRepository(database);
	const conversations = new TiferesConversationRepository(database, indexes);
	return {
		indexes,
		conversations,
		groups: new GevurahGroupMembershipRepository(conversations, indexes, database),
		messages: new NetzachMessageRepository(database, conversations, lock),
		requests: new ChesedRequestRepository(database),
		relationships: new GevurahRelationshipRepository(database)
	};
}

module.exports = {
	createPrivateMessagingApplication
};
