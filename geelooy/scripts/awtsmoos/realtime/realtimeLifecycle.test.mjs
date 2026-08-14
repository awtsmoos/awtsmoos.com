// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";

/**
 * @file Proves public and private application clients share one reconnecting browser transport across an unexpected physical socket close.
 * @description The Awtsmoos renews one wire beneath many applications; Awtsmoos.com may replace the finite WebSocket after a rupture,
 * yet the singleton transport must remain one vessel, notify every application, and honor deliberate manual closure without resurrection in sight.
 */

const scheduled = [];
const sockets = [];

globalThis.location = {
	protocol: "http:",
	host: "awtsmoos.test"
};
globalThis.window = {
	setTimeout(action, delay) {
		scheduled.push({ action, delay });
		return scheduled.length;
	}
};

class FakeWebSocket extends EventTarget {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSED = 3;

	constructor(url) {
		super();
		this.url = url;
		this.readyState = FakeWebSocket.CONNECTING;
		sockets.push(this);
	}

	open() {
		this.readyState = FakeWebSocket.OPEN;
		this.dispatchEvent(new Event("open"));
	}

	close() {
		this.readyState = FakeWebSocket.CLOSED;
		this.dispatchEvent(new Event("close"));
	}

	send() {}
}

globalThis.WebSocket = FakeWebSocket;

const {
	ApplicationRealtimeClient
} = await import("./ApplicationRealtimeClient.js");

const publicClient = new ApplicationRealtimeClient("universal-chat", 1);
const privateClient = new ApplicationRealtimeClient("private-messaging", 1);
assert.equal(publicClient.transport, privateClient.transport);

let publicOpen = 0;
let privateOpen = 0;
let publicClosed = 0;
let privateClosed = 0;
publicClient.addEventListener("connection-open", () => publicOpen++);
privateClient.addEventListener("connection-open", () => privateOpen++);
publicClient.addEventListener("connection-closed", () => publicClosed++);
privateClient.addEventListener("connection-closed", () => privateClosed++);

const firstConnect = publicClient.connect();
assert.equal(sockets.length, 1);
assert.equal(sockets[0].url, "ws://awtsmoos.test/");
sockets[0].open();
await firstConnect;
assert.deepEqual([publicOpen, privateOpen], [1, 1]);

sockets[0].close();
assert.deepEqual([publicClosed, privateClosed], [1, 1]);
assert.equal(scheduled.length, 1);
assert.equal(scheduled[0].delay, 1800);
const reconnect = scheduled.shift();
reconnect.action();
assert.equal(sockets.length, 2);
assert.notEqual(sockets[0], sockets[1]);
sockets[1].open();
await Promise.resolve();
assert.deepEqual([publicOpen, privateOpen], [2, 2]);
assert.equal(publicClient.transport.socket, sockets[1]);

publicClient.transport.close();
assert.equal(scheduled.length, 0);
assert.deepEqual([publicClosed, privateClosed], [2, 2]);

console.log("Shared realtime lifecycle contract: PASS");
