//B"H
//Boruch Hashem
//Blessed is He

/**
 * Persistence tests prove that social covenants survive coordinator replacement
 * through one adapter contract. The Awtsmoos renews state beyond process memory;
 * Awtsmoos.com reloads a complete canonical record rather than scattered fragments.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { MemoryShemaPersistence } = require("./persistence/MemoryShemaPersistence.js");
const { ShemaStateRepository } = require("./persistence/ShemaStateRepository.js");
const { SocialCoordinator } = require("./social/SocialCoordinator.js");

function client(accountId) {
	return {
		id: `client-${accountId}`,
		send() {},
		verifiedAccountId: accountId
	};
}

function open(social, accountId, displayName) {
	const connection = client(accountId);
	social.open(connection, {
		displayName,
		privacy: { invitations: "friends", presence: "friends" }
	});
	return connection;
}

test("repository reload preserves friendship, blocks, profiles, and schema", () => {
	const adapter = new MemoryShemaPersistence();
	const firstRepository = new ShemaStateRepository(adapter);
	const first = new SocialCoordinator(new ArenaDirectory(), {
		repository: firstRepository
	});
	const aleph = open(first, "account:aleph", "Aleph");
	const bet = open(first, "account:bet", "Bet");
	first.friendRequest(aleph, "account:bet");
	first.friendRequest(bet, "account:aleph");
	first.block(aleph, "account:third");

	const secondRepository = new ShemaStateRepository(adapter);
	const second = new SocialCoordinator(new ArenaDirectory(), {
		repository: secondRepository
	});
	assert.deepEqual(second.friends.list("account:aleph").friends, ["account:bet"]);
	assert.deepEqual(second.blocks.list("account:aleph").blocked, ["account:third"]);
	assert.equal(second.privacy.profile("account:aleph").displayName, "Aleph");
	assert.equal(secondRepository.read().schemaVersion, 1);
});

test("adapter boundaries return clones instead of mutable canonical objects", () => {
	const adapter = new MemoryShemaPersistence({
		blocks: {},
		friendRequests: {},
		friends: {},
		invitations: {},
		profiles: {},
		schemaVersion: 1,
		worlds: {}
	});
	const loaded = adapter.load();
	loaded.profiles.invented = { displayName: "Invented" };
	assert.equal(adapter.load().profiles.invented, undefined);
});
