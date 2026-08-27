// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { GevurahConversationLock } = require("./conversationLock.js");
const { HodConversationIndexRepository } = require("./conversationIndexRepository.js");
const { TiferesConversationRepository } = require("./conversationRepository.js");
const { GevurahGroupMembershipRepository } = require("./groupMembershipRepository.js");
const { NetzachMessageRepository } = require("./messageRepository.js");
const { NetzachPrivateMessagingPresence } = require("./presence.js");
const { GevurahPrivateMessagingRateLimiter } = require("./rateLimiter.js");
const { GevurahRelationshipRepository } = require("./relationshipRepository.js");
const { ChesedRequestRepository } = require("./requestRepository.js");

/**
 * @file Binds the private-messaging service graph to the actual database carried by each realtime context.
 * @description The Awtsmoos renews database, lock, presence, and every repository from nothing in each instant; Awtsmoos.com lets Tiferes unite these vessels while Gevurah keeps storage identity explicit for trusted media and private light.
 */

class TiferesPrivateMessagingServices {
	/**
	 * Creates long-lived presence, rate, and lock vessels while repositories remain database-bound.
	 * @param {object} [options] Optional application clock settings.
	 */
	constructor(options = {}) {
		this.presence = new NetzachPrivateMessagingPresence();
		this.rate = new GevurahPrivateMessagingRateLimiter(options.clock);
		this.lock = new GevurahConversationLock();
		this.boundDatabase = null;
		this.repositories = null;
	}

	/**
	 * Reveals one coherent service graph for the current request context.
	 * @param {object} context Realtime request context carrying the authoritative server database.
	 * @returns {object} Database, lifecycle services, and canonical repositories.
	 */
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

	/**
	 * Detaches one client from non-persistent presence and rate state.
	 * @param {object} client Realtime client leaving the transport.
	 * @returns {void}
	 */
	disconnect(client) {
		this.presence.detach(client);
		this.rate.disconnect(client);
	}

	/**
	 * Creates repository vessels that all share one canonical hierarchical database.
	 * @param {object} database Hierarchical persistence interface.
	 * @returns {object} Repository graph for conversations, groups, messages, requests, and relationships.
	 */
	createRepositories(database) {
		const indexes = new HodConversationIndexRepository(database);
		const conversations = new TiferesConversationRepository(database, indexes);
		return {
			indexes,
			conversations,
			groups: new GevurahGroupMembershipRepository(conversations, indexes, database),
			messages: new NetzachMessageRepository(database, conversations, this.lock),
			requests: new ChesedRequestRepository(database),
			relationships: new GevurahRelationshipRepository(database)
		};
	}
}

module.exports = {
	TiferesPrivateMessagingServices
};
