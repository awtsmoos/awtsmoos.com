//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Extensibility is truthful only when one server may grow without contaminating
 * another. The Awtsmoos renews both worlds; Awtsmoos.com proves registration,
 * routing, discovery, and isolation through the unchanged public doorway.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	getRealtimePlatform,
	listRealtimeApplications,
	registerRealtimeApplication
} = require("../apps/applicationCatalog.js");
const { routeMessage } = require("../apps/messageRouter.js");

function client() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

function futureApplication() {
	return {
		id: "future-app",
		legacyTypes: ["FUTURE_HELLO"],
		versions: [1, 2],
		handleLegacy(_context, data) {
			_context.client.send({
				type: "FUTURE_HELLO_ACK",
				value: data.value
			});
		},
		handleVersioned(_context, request) {
			return {
				payload: request.payload,
				type: "future.echoed"
			};
		}
	};
}

test("registers a future application without changing the router", async () => {
	const server = {};
	const socketClient = client();
	const platform = getRealtimePlatform(server);

	registerRealtimeApplication(server, futureApplication);
	assert.equal(getRealtimePlatform(server), platform);
	assert.equal(
		listRealtimeApplications(server).some(app => app.id === "future-app"),
		true
	);

	await routeMessage(server, socketClient, JSON.stringify({
		type: "FUTURE_HELLO",
		value: 42
	}));
	assert.deepEqual(socketClient.messages.at(-1), {
		type: "FUTURE_HELLO_ACK",
		value: 42
	});
});

test("keeps application registries isolated per server", () => {
	const firstServer = {};
	const secondServer = {};
	registerRealtimeApplication(firstServer, futureApplication);

	assert.equal(
		listRealtimeApplications(firstServer).some(app => app.id === "future-app"),
		true
	);
	assert.equal(
		listRealtimeApplications(secondServer).some(app => app.id === "future-app"),
		false
	);
});
