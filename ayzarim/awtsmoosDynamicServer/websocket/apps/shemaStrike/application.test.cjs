//B"H
//Boruch Hashem
//Blessed is He

/**
 * Application tests guard the old registry while proving the new protocol gate.
 * The Awtsmoos renews every named world; Awtsmoos.com adds Shema Strike after
 * the established factories and refuses client-authored coordinates or damage.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const definitions = require("../applicationDefinitions.js");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { handleShemaStrikeRequest } = require("./application.js");
const { MESSAGE_TYPES, RESPONSE_TYPES } = require("./protocol.js");
const { validateInput } = require("./validation.js");

function client() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

test("preserves every existing application factory and appends Shema Strike", () => {
	const names = definitions.builtInApplicationFactories().map((factory) => factory.name);
	for (const existing of [
		"createAwtsmoosCoreApplication",
		"createAwtsmoosSocialApplication",
		"createSefiraClashApplication",
		"createMitzvahWorldApplication",
		"createOhrHagnuzApplication"
	]) {
		assert.ok(names.includes(existing), `Missing existing factory: ${existing}`);
	}
	assert.equal(names.at(-1), "createShemaStrikeApplication");
});

test("dispatches create and join without changing the versioned router contract", () => {
	const directory = new ArenaDirectory();
	const owner = client();
	const guest = client();
	const created = handleShemaStrikeRequest(directory, owner, {
		payload: { name: "Owner" },
		type: MESSAGE_TYPES.CREATE
	});
	const joined = handleShemaStrikeRequest(directory, guest, {
		payload: { joinCode: created.payload.arena.joinCode, name: "Guest" },
		type: MESSAGE_TYPES.JOIN
	});

	assert.equal(created.type, RESPONSE_TYPES.CREATED);
	assert.equal(joined.type, RESPONSE_TYPES.JOINED);
	assert.equal(joined.payload.arena.state.phase, "active");
	directory.disconnect(owner);
	directory.disconnect(guest);
});

test("strips coordinates, health, and hit claims from accepted input", () => {
	const input = validateInput({
		attack: true,
		axis: 0.4,
		health: 999,
		hitPlayerId: "invented",
		inputSequence: 7,
		jump: false,
		x: 12345,
		y: -12345
	});

	assert.deepEqual(input, {
		attack: true,
		axis: 0.4,
		inputSequence: 7,
		jump: false
	});
});

test("rejects unknown commands with a structured realtime error", () => {
	assert.throws(
		() => handleShemaStrikeRequest(new ArenaDirectory(), client(), {
			payload: {},
			type: "arena.invent-victory"
		}),
		(error) => error.code === "UNKNOWN_MESSAGE"
	);
});
