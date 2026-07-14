//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reconnect and spectator tests distinguish witness, absence, return, and exit.
 * The Awtsmoos renews each identity; Awtsmoos.com rotates finite tickets and
 * refuses to let spectators cross the server's fighter-authority boundary.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");

function client(name) {
	return {
		messages: [],
		name,
		send(message) {
			this.messages.push(message);
		}
	};
}

function reconnectHarness() {
	let now = 1000;
	const scheduled = [];
	const directory = new ArenaDirectory({
		reconnectOptions: {
			clearTimer() {},
			now: () => now,
			scheduleTimer(callback) {
				scheduled.push(callback);
				return { unref() {} };
			}
		}
	});
	return {
		directory,
		expire(index = 0) {
			now = 1000000;
			scheduled[index]();
		}
	};
}

test("spectators receive state but cannot submit fighter input", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	const witness = client("witness");
	const created = directory.create(owner, "Owner", {
		arenaName: "Witness Arena",
		visibility: "public"
	});
	const spectating = directory.spectate(witness, created.arena.joinCode, "Witness");

	assert.equal(spectating.role, "spectator");
	assert.equal(spectating.playerId, null);
	assert.equal(spectating.arena.spectators.length, 1);
	assert.throws(
		() => directory.input(witness, {
			attack: true,
			axis: 1,
			inputSequence: 1,
			jump: true
		}),
		(error) => error.code === "SPECTATOR_INPUT_FORBIDDEN"
	);
	directory.leave(witness);
	directory.leave(owner);
});

test("disconnect preserves fighter identity and reconnect rotates its ticket", () => {
	const directory = new ArenaDirectory();
	const firstClient = client("first");
	const secondClient = client("second");
	const replayClient = client("replay");
	const created = directory.create(firstClient, "Pilgrim");
	const originalTicket = created.reconnectTicket;
	const originalId = created.playerId;

	const suspended = directory.disconnect(firstClient);
	assert.equal(suspended.suspended, true);
	const resumed = directory.reconnect(secondClient, originalTicket);
	assert.equal(resumed.playerId, originalId);
	assert.notEqual(resumed.reconnectTicket, originalTicket);
	assert.throws(
		() => directory.reconnect(replayClient, originalTicket),
		(error) => error.code === "RECONNECT_TICKET_INVALID"
	);
	directory.leave(secondClient);
});

test("expired reconnect records remove the final participant and room", () => {
	const harness = reconnectHarness();
	const owner = client("owner");
	const created = harness.directory.create(owner, "Owner", {
		arenaName: "Expiring Arena",
		reconnectWindowMs: 5000
	});

	harness.directory.disconnect(owner);
	assert.equal(harness.directory.rooms.has(created.arena.joinCode), true);
	harness.expire();
	assert.equal(harness.directory.rooms.has(created.arena.joinCode), false);
});

test("explicit leave revokes reconnect instead of creating suspended state", () => {
	const directory = new ArenaDirectory();
	const owner = client("owner");
	const created = directory.create(owner, "Owner");
	const ticket = created.reconnectTicket;

	directory.leave(owner);
	assert.throws(
		() => directory.reconnect(client("late"), ticket),
		(error) => error.code === "RECONNECT_TICKET_INVALID"
	);
});
