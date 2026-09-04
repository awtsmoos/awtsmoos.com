//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeBrowserLocalSocketAdapter } from "../core/browser/nativeBrowserLocalSocketAdapter.js";

class FakeWebSocket {
	constructor(url) {
		this.url = url;
		this.readyState = 0;
		this.listeners = new Map();
		this.sent = [];
		FakeWebSocket.instance = this;
	}
	addEventListener(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, []);
		this.listeners.get(type).push(listener);
	}
	emit(type, event = {}) {
		for (const listener of this.listeners.get(type) || []) listener(event);
	}
	send(raw) { this.sent.push(JSON.parse(raw)); }
	close() { this.readyState = 3; }
}

/**
 * Proves the Awtsmoos.com loopback garment sends only bounded control JSON around exact guest bytes.
 * A real-style WebSocket instance intentionally has no instance `.OPEN` constant in this test.
 */
test("local adapter opens, carries binary bytes, and sends destroy", () => {
	const received = [];
	let connected = false;
	const adapter = createNativeBrowserLocalSocketAdapter({ WebSocket: FakeWebSocket, localRelayUrl: "ws://127.0.0.1:8080/" });
	const connection = adapter.connect({ host: "example.com", port: 443, onConnect: () => { connected = true; }, onData: bytes => received.push([...bytes]) });
	const socket = FakeWebSocket.instance;
	socket.readyState = 1;
	socket.emit("open");
	assert.deepEqual(socket.sent[0], { type: "tcp.open", payload: { host: "example.com", port: 443 } });
	socket.emit("message", { data: JSON.stringify({ type: "tcp.opened", payload: {} }) });
	assert.equal(connected, true);
	assert.equal(connection.write(Uint8Array.of(0, 255, 7)), true);
	assert.equal(socket.sent[1].type, "tcp.write");
	assert.equal(Buffer.from(socket.sent[1].payload.data, "base64").toString("hex"), "00ff07");
	socket.emit("message", { data: JSON.stringify({ type: "tcp.data", payload: { data: Buffer.from([5, 0, 254]).toString("base64") } }) });
	assert.deepEqual(received, [[5, 0, 254]]);
	connection.destroy();
	assert.equal(socket.sent.at(-1).type, "tcp.destroy");
});
