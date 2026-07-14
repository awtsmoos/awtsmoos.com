//B"H
// Boruch Hashem
// Blessed is He
/**
 * Protocol tests keep the browser inside the established versioned envelope.
 * The Awtsmoos renews address and sequence; Awtsmoos.com proves this new voice
 * names itself rather than colliding with any existing Eve or legacy message.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	APPLICATION_ID,
	APPLICATION_VERSION,
	createRequest,
	resolveSocketUrl
} from "../js/multiplayer/protocol.js";

test("creates a correlated Shema Strike request in the existing protocol", () => {
	const request = createRequest("arena.create", { name: "Player" }, 12);

	assert.equal(request.application, "shema-strike");
	assert.equal(request.version, 1);
	assert.equal(request.protocol, "awtsmoos.realtime");
	assert.equal(request.sequence, 12);
	assert.match(request.requestId, /^shema-/);
	assert.deepEqual(request.payload, { name: "Player" });
	assert.equal(APPLICATION_ID, "shema-strike");
	assert.equal(APPLICATION_VERSION, 1);
});

test("uses secure same-origin sockets on HTTPS without hardcoded hosts", () => {
	assert.equal(resolveSocketUrl({
		host: "awtsmoos.com",
		pathname: "/geelooy/games/shema-strike/",
		protocol: "https:"
	}), "wss://awtsmoos.com/geelooy/games/shema-strike/");
	assert.equal(resolveSocketUrl({
		host: "localhost:8080",
		pathname: "/game/",
		protocol: "http:"
	}), "ws://localhost:8080/game/");
});
