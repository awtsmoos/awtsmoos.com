//B"H
//Boruch Hashem
//Blessed is He

/**
 * Core arena tests witness authority, stale-input rejection, combat, and
 * voluntary cleanup. The Awtsmoos renews every assertion; Awtsmoos.com requires
 * real server state rather than client declarations or brittle revision numbers.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { ArenaFighter } = require("./ArenaFighter.js");
const { ArenaSimulation } = require("./ArenaSimulation.js");

function client(name) {
	return {
		messages: [],
		name,
		send(message) {
			this.messages.push(message);
		}
	};
}

test("creates and joins one authoritative arena without exposing clients", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	const guest = client("guest");
	const created = directory.create(owner, "Owner");
	const joined = directory.join(guest, created.arena.joinCode, "Guest");

	assert.notEqual(created.playerId, joined.playerId);
	assert.equal(joined.arena.state.fighters.length, 2);
	assert.equal(joined.arena.state.phase, "active");
	assert.equal("client" in joined.arena.state.fighters[0], false);
	assert.equal(owner.messages.at(-1).type, "arena.changed");
	assert.ok(guest.messages.at(-1).payload.arena.revision >= 2);
	directory.leave(owner);
	directory.leave(guest);
});

test("rejects stale input while retaining the newest semantic intention", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	directory.create(owner, "Owner");

	assert.equal(directory.input(owner, {
		attack: false,
		axis: 1,
		inputSequence: 2,
		jump: false
	}).accepted, true);
	assert.equal(directory.input(owner, {
		attack: true,
		axis: -1,
		inputSequence: 1,
		jump: true
	}).accepted, false);
	assert.equal(directory.snapshot(owner).arena.state.fighters[0].x, 180);
	directory.leave(owner);
});

test("server simulation resolves attack overlap and damage", () => {
	const attacker = new ArenaFighter(client("attacker"), "Attacker", 0, true);
	const defender = new ArenaFighter(client("defender"), "Defender", 1);
	const simulation = new ArenaSimulation([attacker, defender]);
	attacker.x = 200;
	defender.x = 250;
	attacker.invulnerableFrames = 0;
	defender.invulnerableFrames = 0;
	attacker.acceptInput({ attack: true, axis: 0, inputSequence: 1, jump: false });

	for (let frame = 0; frame < 3; frame += 1) {
		simulation.step();
	}
	assert.equal(defender.health, 76);
	assert.equal(attacker.score, 0);
});

test("explicit leave migrates ownership and removes the final empty room", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	const guest = client("guest");
	const created = directory.create(owner, "Owner");
	directory.join(guest, created.arena.joinCode, "Guest");

	directory.leave(owner);
	assert.equal(directory.snapshot(guest).arena.state.fighters[0].isOwner, true);
	directory.leave(guest);
	assert.equal(directory.rooms.has(created.arena.joinCode), false);
});
