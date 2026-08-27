//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The router is tested as a boundary, not trusted as an intention. The Awtsmoos
 * renews every request; Awtsmoos.com proves correlation, safe replay, monotonic
 * sequence, and application isolation before live clients depend upon them.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ApplicationRegistry } = require("./ApplicationRegistry.js");
const { ApplicationRouter } = require("./ApplicationRouter.js");

function client() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

function envelope(requestId, sequence, payload = { value: 7 }) {
	return JSON.stringify({
		application: "test-app",
		payload,
		protocol: "awtsmoos.realtime",
		requestId,
		sequence,
		type: "echo.request",
		version: 1
	});
}

function routerWithCounter(counter) {
	const registry = new ApplicationRegistry();
	registry.register({
		id: "test-app",
		legacyTypes: [],
		versions: [1],
		handleVersioned(_context, request) {
			counter.calls += 1;
			return {
				payload: request.payload,
				type: "echo.response"
			};
		}
	});
	return new ApplicationRouter(registry);
}

test("routes a correlated versioned request", async () => {
	const counter = { calls: 0 };
	const router = routerWithCounter(counter);
	const socketClient = client();

	await router.route({}, socketClient, envelope("request-1", 1));

	assert.equal(counter.calls, 1);
	assert.equal(socketClient.messages[0].requestId, "request-1");
	assert.equal(socketClient.messages[0].type, "echo.response");
	assert.deepEqual(socketClient.messages[0].payload, { value: 7 });
});

test("replays duplicate request results without repeating side effects", async () => {
	const counter = { calls: 0 };
	const router = routerWithCounter(counter);
	const socketClient = client();
	const message = envelope("request-duplicate", 1);

	await router.route({}, socketClient, message);
	await router.route({}, socketClient, message);

	assert.equal(counter.calls, 1);
	assert.deepEqual(socketClient.messages[0], socketClient.messages[1]);
});

test("rejects stale sequences and conflicting request identifiers", async () => {
	const counter = { calls: 0 };
	const router = routerWithCounter(counter);
	const socketClient = client();

	await router.route({}, socketClient, envelope("request-a", 2));
	await router.route({}, socketClient, envelope("request-b", 1));
	await router.route({}, socketClient, envelope("request-a", 3, { value: 9 }));

	assert.equal(socketClient.messages[1].payload.code, "STALE_SEQUENCE");
	assert.equal(socketClient.messages[2].payload.code, "REQUEST_ID_CONFLICT");
	assert.equal(counter.calls, 1);
});
