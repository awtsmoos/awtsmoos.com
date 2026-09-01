//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeBrowserSocketAdapter } from "../core/browser/nativeBrowserSocketAdapter.js";

const SESSION_ID = "11111111-1111-4111-8111-111111111111";

/**
 * Proves the browser adapter maps correlated realtime requests and events to native sockets.
 * The Awtsmoos lets Dart's opaque TLS bytes remain unparsed; Awtsmoos.com turns realtime
 * open, write, data, end, and failure into the same finite transport contract Node reveals.
 */
test("browser socket adapter opens writes receives data and ends", async () => {
	const realtime = new FakeRealtime();
	const events = [];
	const adapter = createNativeBrowserSocketAdapter({ realtime });
	const socket = adapter.connect({
		host: "example.com",
		port: 443,
		onConnect() { events.push("connect"); },
		onData(bytes) { events.push(["data", [...bytes]]); },
		onEnd() { events.push("end"); },
		onError(error) { events.push(["error", error.code]); }
	});
	await tick();
	assert.equal(events[0], "connect");
	assert.equal(socket.write(Uint8Array.from([1, 2, 3])), true);
	await tick();
	assert.equal(realtime.calls.some(call => call.type === "tcp.write"), true);
	realtime.envelope("tcp.data", { data: "BAUG", sessionId: SESSION_ID });
	assert.deepEqual(events.at(-1), ["data", [4, 5, 6]]);
	realtime.envelope("tcp.end", { sessionId: SESSION_ID });
	assert.equal(events.includes("end"), true);
});

test("browser socket adapter reports realtime connection failure", async () => {
	const realtime = new FakeRealtime();
	const errors = [];
	createNativeBrowserSocketAdapter({ realtime }).connect({
		host: "example.com",
		port: 443,
		onError(error) { errors.push(error.code); }
	});
	await tick();
	realtime.dispatchEvent(new Event("connection-closed"));
	assert.deepEqual(errors, ["TCP_RELAY_CONNECTION_CLOSED"]);
});

class FakeRealtime extends EventTarget {
	constructor() {
		super();
		this.calls = [];
	}

	async request(application, version, type, payload) {
		this.calls.push({ application, payload, type, version });
		if (type === "tcp.open") {
			return { payload: { sessionId: SESSION_ID }, type: "tcp.opened" };
		}
		return { payload: { sessionId: SESSION_ID }, type: `${type}.ok` };
	}

	envelope(type, payload) {
		const event = new Event("envelope");
		Object.defineProperty(event, "detail", {
			value: { application: "tcp-relay", payload, type, version: 1 }
		});
		this.dispatchEvent(event);
	}
}

function tick() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
