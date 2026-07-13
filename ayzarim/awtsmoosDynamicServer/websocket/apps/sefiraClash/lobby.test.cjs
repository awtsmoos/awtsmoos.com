//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Shared-room behavior is proven through independent socket vessels. The
 * Awtsmoos renews every membership; Awtsmoos.com verifies privacy, capacity,
 * readiness, owner migration, broadcasts, and disconnect cleanup as server truth.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { LobbyDirectory } = require("./LobbyDirectory.js");

function client(name) {
	return {
		messages: [],
		name,
		send(message) {
			this.messages.push(message);
		}
	};
}

function ownerProfile(name = "Owner") {
	return {
		characterId: "hod-staff",
		displayName: name,
		rules: { items: true, stocks: 3, teams: false },
		team: 1
	};
}

function joiningProfile(joinCode, name) {
	return {
		characterId: "chesed-fist",
		displayName: name,
		joinCode,
		team: 2
	};
}

test("creates and joins a private four-player room with safe snapshots", () => {
	const directory = new LobbyDirectory();
	const owner = client("owner");
	const guest = client("guest");
	const created = directory.create(owner, ownerProfile());
	const joined = directory.join(
		guest,
		joiningProfile(created.lobby.joinCode, "Guest")
	);

	assert.notEqual(created.playerId, joined.playerId);
	assert.equal(joined.lobby.players.length, 2);
	assert.equal(joined.lobby.players[0].isOwner, true);
	assert.equal("client" in joined.lobby.players[0], false);
	assert.equal(owner.messages.at(-1).type, "lobby.changed");
	assert.equal(guest.messages.at(-1).payload.lobby.revision, 2);
});

test("invalidates readiness after character or team changes", () => {
	const directory = new LobbyDirectory();
	const owner = client("owner");
	directory.create(owner, ownerProfile());

	directory.update(owner, { ready: true });
	assert.equal(directory.snapshot(owner).players[0].ready, true);
	directory.update(owner, { characterId: "yesod-lance" });
	assert.equal(directory.snapshot(owner).players[0].ready, false);
});

test("migrates ownership and deletes a room after its final disconnect", () => {
	const directory = new LobbyDirectory();
	const owner = client("owner");
	const guest = client("guest");
	const created = directory.create(owner, ownerProfile());
	directory.join(guest, joiningProfile(created.lobby.joinCode, "Guest"));

	directory.disconnect(owner);
	assert.equal(directory.snapshot(guest).players[0].isOwner, true);
	directory.disconnect(guest);
	assert.throws(
		() => directory.join(client("late"), joiningProfile(created.lobby.joinCode, "Late")),
		error => error.code === "LOBBY_NOT_FOUND"
	);
});

test("rejects a fifth player without corrupting room membership", () => {
	const directory = new LobbyDirectory();
	const owner = client("owner");
	const created = directory.create(owner, ownerProfile());
	for (let index = 1; index < 4; index += 1) {
		directory.join(
			client(`guest-${index}`),
			joiningProfile(created.lobby.joinCode, `Guest ${index}`)
		);
	}
	assert.throws(
		() => directory.join(
			client("fifth"),
			joiningProfile(created.lobby.joinCode, "Fifth")
		),
		error => error.code === "LOBBY_FULL"
	);
	assert.equal(directory.snapshot(owner).players.length, 4);
});
