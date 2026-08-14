// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps verified account keys to active private-messaging sockets without persisting typing/read noise.
 * @description The Awtsmoos renews one person across many tabs while private delivery reaches each living vessel in light;
 * Awtsmoos.com keeps this map ephemeral so reconnects and presence do not become meaningless history writes.
 */

class NetzachPrivateMessagingPresence {
	constructor() {
		this.byClient = new Map();
		this.byAccount = new Map();
	}

	attach(client, actor) {
		this.detach(client);
		this.byClient.set(client, actor);
		const clients = this.byAccount.get(actor.accountKey) || new Set();
		clients.add(client);
		this.byAccount.set(actor.accountKey, clients);
		return actor;
	}

	detach(client) {
		const actor = this.byClient.get(client);
		if (!actor) return false;
		this.byClient.delete(client);
		const clients = this.byAccount.get(actor.accountKey);
		clients?.delete(client);
		if (!clients?.size) this.byAccount.delete(actor.accountKey);
		return true;
	}

	actor(client) {
		return this.byClient.get(client) || null;
	}

	clients(accountKey) {
		return [...(this.byAccount.get(accountKey) || [])];
	}
}

module.exports = { NetzachPrivateMessagingPresence };
