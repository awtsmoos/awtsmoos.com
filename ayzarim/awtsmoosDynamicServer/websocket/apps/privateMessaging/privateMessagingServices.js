// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { GevurahConversationLock } = require("./conversationLock.js");
const { GevurahDurableConversationLock } = require("./conversationFileLock.js");
const { HodConversationIndexRepository } = require("./conversationIndexRepository.js");
const { TiferesConversationRepository } = require("./conversationRepository.js");
const { GevurahGroupMembershipRepository } = require("./groupMembershipRepository.js");
const { HodMessageIntentRepository } = require("./messageIntentRepository.js");
const { NetzachMessageRepository } = require("./messageRepository.js");
const { NetzachPrivateMessagingPresence } = require("./presence.js");
const { GevurahPrivateMessagingRateLimiter } = require("./rateLimiter.js");
const { GevurahRelationshipRepository } = require("./relationshipRepository.js");
const { ChesedRequestRepository } = require("./requestRepository.js");

/**
 * @file Binds private messaging to the actual database and gives canonical appends a filesystem-shared lock when real DosDB permits it.
 * @description The Awtsmoos renews database, lock, presence, and repository from nothing each instant; Awtsmoos.com joins memory and disk in Tiferes,
 * letting one conversation remain one ordered vessel across workers while tests and alternate adapters retain a lawful in-process path.
 */

class TiferesPrivateMessagingServices {
	constructor(options = {}) {
		this.presence = new NetzachPrivateMessagingPresence();
		this.rate = new GevurahPrivateMessagingRateLimiter(options.clock);
		this.memoryLock = new GevurahConversationLock();
		this.boundDatabase = null;
		this.repositories = null;
	}

	/** Reveals one coherent service graph for the current realtime request context. */
	forContext(context) {
		const database = context.server?.db;
		if (!database) {
			throw new RealtimeError(
				"PRIVATE_MESSAGING_DATABASE_REQUIRED",
				"Private messaging storage is unavailable.",
				null,
				503
			);
		}
		if (!this.repositories || this.boundDatabase !== database) {
			this.boundDatabase = database;
			this.repositories = this.createRepositories(database);
		}
		return {
			database,
			presence: this.presence,
			rate: this.rate,
			...this.repositories
		};
	}

	/** Detaches one client from non-persistent presence and rate state. */
	disconnect(client) {
		this.presence.detach(client);
		this.rate.disconnect(client);
	}

	/** Creates one database-bound repository graph, including durable intent and conversation serialization vessels. */
	createRepositories(database) {
		const indexes = new HodConversationIndexRepository(database);
		const conversations = new TiferesConversationRepository(database, indexes);
		const intents = new HodMessageIntentRepository(database);
		const lock = new GevurahDurableConversationLock(database, this.memoryLock);
		return {
			indexes,
			conversations,
			groups: new GevurahGroupMembershipRepository(
				conversations,
				indexes,
				database
			),
			intents,
			messages: new NetzachMessageRepository(
				database,
				conversations,
				lock,
				intents
			),
			requests: new ChesedRequestRepository(database),
			relationships: new GevurahRelationshipRepository(database)
		};
	}
}

module.exports = {
	TiferesPrivateMessagingServices
};
