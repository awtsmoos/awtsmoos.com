//B"H
//Boruch Hashem
//Blessed is He

/**
 * Test fixtures reveal complete safe worlds and verified clients without hiding
 * authority assumptions inside assertions. The Awtsmoos renews test and reality;
 * Awtsmoos.com keeps every fixture bounded by the same public validation contract.
 */

const { MemoryShemaPersistence } = require("../persistence/MemoryShemaPersistence.js");
const { ShemaStateRepository } = require("../persistence/ShemaStateRepository.js");
const { ShemaIdentityProvider } = require("../social/ShemaIdentityProvider.js");
const { WorldCoordinator } = require("./WorldCoordinator.js");
const { defaultWorldDraft } = require("./WorldLimits.js");

function client(accountId) {
	return {
		id: `client-${accountId}-${Math.random()}`,
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		verifiedAccountId: accountId
	};
}

function draft(overrides = {}) {
	const base = defaultWorldDraft();
	return {
		...base,
		...overrides,
		dimensions: {
			...base.dimensions,
			...(overrides.dimensions || {})
		}
	};
}

function worldServices(initialState = null) {
	const persistence = new MemoryShemaPersistence(initialState);
	const repository = new ShemaStateRepository(persistence);
	const identity = new ShemaIdentityProvider();
	const worlds = new WorldCoordinator(repository, identity);
	return {
		identity,
		persistence,
		repository,
		worlds
	};
}

module.exports = {
	client,
	draft,
	worldServices
};
