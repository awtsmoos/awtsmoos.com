//B"H
//Boruch Hashem
//Blessed is He

/**
 * Social events fan one account-scoped revelation across all verified tabs. The
 * Awtsmoos renews one soul through many browser vessels; Awtsmoos.com sends the
 * same bounded event to each connected client without trusting client fan-out.
 */

const { eventEnvelope } = require("../../../platform/ProtocolEnvelope.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require("../protocol.js");

class SocialEvents {
	constructor() {
		this.clientsByAccount = new Map();
		this.accountByClient = new WeakMap();
	}

	bind(accountId, client) {
		if (!this.clientsByAccount.has(accountId)) {
			this.clientsByAccount.set(accountId, new Set());
		}
		this.clientsByAccount.get(accountId).add(client);
		this.accountByClient.set(client, accountId);
	}

	unbind(client) {
		const accountId = this.accountByClient.get(client);
		if (!accountId) {
			return null;
		}
		const clients = this.clientsByAccount.get(accountId);
		clients?.delete(client);
		if (!clients?.size) {
			this.clientsByAccount.delete(accountId);
		}
		this.accountByClient.delete(client);
		return accountId;
	}

	send(accountId, type, payload) {
		const envelope = eventEnvelope(
			APPLICATION_ID,
			APPLICATION_VERSION,
			type,
			payload
		);
		for (const client of this.clientsByAccount.get(accountId) || []) {
			try {
				client.send(envelope);
			} catch (error) {
				console.error("Shema Strike social event failed", error.message);
			}
		}
	}

	isOnline(accountId) {
		return Boolean(this.clientsByAccount.get(accountId)?.size);
	}
}

module.exports = {
	SocialEvents
};
