//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Historical packet shapes are promises to living applications. The Awtsmoos
 * renews their meaning; Awtsmoos.com proves malformed JSON, unknown messages,
 * and social pings retain the exact garments old clients already understand.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { routeMessage } = require("./messageRouter.js");

function client() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

test("preserves the legacy unknown-message response shape", async () => {
	const socketClient = client();
	await routeMessage({}, socketClient, JSON.stringify({ type: "OLD_UNKNOWN" }));

	const response = socketClient.messages[0];
	assert.equal(response.type, "UNKNOWN_MESSAGE");
	assert.equal(response.receivedType, "OLD_UNKNOWN");
	assert.equal(typeof response.at, "number");
	assert.equal("received" in response, false);
});

test("preserves the legacy malformed-message response shape", async () => {
	const socketClient = client();
	await routeMessage({}, socketClient, "{broken-json");

	const response = socketClient.messages[0];
	assert.equal(response.type, "ERROR");
	assert.equal(response.code, "BAD_WS_MESSAGE");
	assert.equal(typeof response.message, "string");
});

test("preserves the legacy social ping and pong contract", async () => {
	const socketClient = client();
	await routeMessage(
		{},
		socketClient,
		JSON.stringify({ id: "legacy-ping", type: "SOCIAL_PING" })
	);

	const response = socketClient.messages[0];
	assert.equal(response.type, "SOCIAL_PONG");
	assert.equal(response.id, "legacy-ping");
	assert.equal(typeof response.at, "number");
});

test("routes versioned core health beside legacy packets", async () => {
	const socketClient = client();
	await routeMessage({}, socketClient, JSON.stringify({
		application: "awtsmoos-core",
		payload: {},
		protocol: "awtsmoos.realtime",
		requestId: "health-request",
		sequence: 1,
		type: "health.ping",
		version: 1
	}));

	assert.equal(socketClient.messages[0].type, "health.pong");
	assert.equal(socketClient.messages[0].payload.alive, true);
});
