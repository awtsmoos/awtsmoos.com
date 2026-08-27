//B"H
//Boruch Hashem
//Blessed is He

/**
 * Discovery and bot tests prove that public visibility is deliberate and bot
 * combat uses ordinary semantic input. The Awtsmoos renews hidden and revealed;
 * Awtsmoos.com never leaks a private room or grants algorithms secret authority.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { validateArenaSettings } = require("./arena/ArenaSettings.js");

function client(name) {
	return {
		messages: [],
		name,
		send(message) {
			this.messages.push(message);
		}
	};
}

function settings(overrides = {}) {
	return {
		arenaName: "Public Test Arena",
		visibility: "public",
		...overrides
	};
}

test("public discovery excludes private and unlisted rooms", () => {
	const directory = new ArenaDirectory();
	const publicHost = client("public");
	const privateHost = client("private");
	const unlistedHost = client("unlisted");
	directory.create(publicHost, "Public Host", settings());
	directory.create(privateHost, "Private Host", settings({ visibility: "private" }));
	directory.create(unlistedHost, "Unlisted Host", settings({ visibility: "unlisted" }));

	const discovery = directory.list({ limit: 10 });
	assert.equal(discovery.items.length, 1);
	assert.equal(discovery.items[0].ownerAlias, "Public Host");
	assert.equal(JSON.stringify(discovery).includes("reconnectTicket"), false);
	assert.equal(JSON.stringify(discovery).includes("client"), false);
	directory.leave(publicHost);
	directory.leave(privateHost);
	directory.leave(unlistedHost);
});

test("discovery filters and paginates bounded public records", () => {
	const directory = new ArenaDirectory();
	const first = client("first");
	const second = client("second");
	directory.create(first, "First", settings({ arenaName: "Aleph Arena", language: "he" }));
	directory.create(second, "Second", settings({ arenaName: "Bet Arena", mode: "duel" }));

	const page = directory.list({ limit: 1 });
	assert.equal(page.items.length, 1);
	assert.equal(page.nextCursor, "1");
	assert.equal(directory.list({ language: "he", limit: 10 }).items.length, 1);
	assert.equal(directory.list({ mode: "duel", limit: 10 }).items.length, 1);
	assert.equal(directory.list({ limit: 10, query: "Bet" }).items[0].arenaName, "Bet Arena");
	directory.leave(first);
	directory.leave(second);
});

test("server bots occupy fighter slots and submit normal input", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	const created = directory.create(owner, "Owner", settings({
		botCount: 1,
		maximumPlayers: 3
	}));
	const room = directory.rooms.get(created.arena.joinCode);
	const bot = room.fighters.find((fighter) => fighter.isBot);

	assert.ok(bot);
	assert.equal(bot.role, "fighter");
	room.tick();
	assert.ok(bot.lastInputSequence > 0);
	assert.equal(room.snapshot().state.phase, "active");
	directory.leave(owner);
	assert.equal(directory.rooms.has(created.arena.joinCode), false);
});

test("settings reject bots that consume every human slot", () => {
	assert.throws(
		() => validateArenaSettings({ botCount: 2, maximumPlayers: 2 }),
		(error) => error.code === "INVALID_BOT_CAPACITY"
	);
});
