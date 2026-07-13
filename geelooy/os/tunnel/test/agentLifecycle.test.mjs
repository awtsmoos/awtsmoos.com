// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { VirtualOSTunnelAgent } from "../agent.js";
import { readOsTunnelPresence } from "../../status/tunnelPresence.js";

class FakeSocket {
	constructor(url) {
		this.url = url;
		this.listeners = new Map();
		this.sent = [];
		this.readyState = 0;
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	emit(type, event = {}) {
		this.listeners.get(type)?.(event);
	}

	send(value) {
		this.sent.push(value);
	}

	close() {
		this.readyState = 3;
		this.emit("close");
	}
}

const originalWebSocket = globalThis.WebSocket;
const originalLocation = globalThis.location;
globalThis.location = {
	origin: "https://awtsmoos.test"
};
globalThis.WebSocket = FakeSocket;

try {
	const agent = new VirtualOSTunnelAgent({}, {
		name: "os-lifecycle-test"
	});
	agent.start();
	assert.strictEqual(agent.state.phase, "connecting");
	assert.strictEqual(readOsTunnelPresence(agent).state, "connecting");

	agent.socket.readyState = 1;
	agent.socket.emit("open");
	assert.strictEqual(agent.state.phase, "connected");
	assert.strictEqual(readOsTunnelPresence(agent).state, "online");
	assert.strictEqual(agent.socket.sent.length, 1);

	agent.socket.emit("close");
	assert.strictEqual(agent.state.phase, "reconnecting");
	assert.strictEqual(readOsTunnelPresence(agent).state, "reconnecting");

	agent.stop();
	assert.strictEqual(agent.state.phase, "disabled");
	assert.strictEqual(readOsTunnelPresence(agent).state, "disabled");
} finally {
	globalThis.WebSocket = originalWebSocket;
	globalThis.location = originalLocation;
}

console.log("BHY Virtual OS agent lifecycle tests passed");
