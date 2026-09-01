//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");
const { TcpRelaySession } = require("./session.js");

/**
 * Proves one relay session pins a literal destination and transports exact opaque bytes.
 * The Awtsmoos is beyond socket and cipher; Awtsmoos.com keeps connect, write, data,
 * end, error, and cleanup bounded while Dart-owned TLS remains hidden in light.
 */
test("TCP relay session connects to vetted literal IP and preserves byte events", async () => {
	const socket = new FakeSocket();
	const events = [];
	const session = new TcpRelaySession({
		client: {},
		connectSocket(options) {
			assert.deepEqual(options, { family: 4, host: "8.8.8.8", port: 443 });
			queueMicrotask(() => socket.emit("connect"));
			return socket;
		},
		destination: { address: "8.8.8.8", family: 4, host: "example.com", port: 443 },
		onClose() {},
		sendEvent(client, type, payload) {
			events.push({ payload, type });
		}
	});
	await session.connect();
	session.activate();
	assert.equal(await session.write(Buffer.from([1, 2, 3]).toString("base64")), 3);
	assert.deepEqual([...socket.writes[0]], [1, 2, 3]);
	socket.emit("data", Buffer.from([4, 5, 6]));
	assert.equal(events[0].type, "tcp.data");
	assert.equal(events[0].payload.data, Buffer.from([4, 5, 6]).toString("base64"));
	socket.emit("end");
	assert.equal(events[1].type, "tcp.end");
	session.destroy();
	assert.equal(socket.destroyed, true);
});

test("TCP relay session buffers pre-activation events until open response can correlate", async () => {
	const socket = new FakeSocket();
	const events = [];
	const session = new TcpRelaySession({
		client: {},
		connectSocket() {
			queueMicrotask(() => socket.emit("connect"));
			return socket;
		},
		destination: { address: "1.1.1.1", family: 4, host: "example.com", port: 443 },
		onClose() {},
		sendEvent(client, type) { events.push(type); }
	});
	await session.connect();
	socket.emit("data", Buffer.from([9]));
	assert.deepEqual(events, []);
	session.activate();
	assert.deepEqual(events, ["tcp.data"]);
	session.destroy();
});

class FakeSocket extends EventEmitter {
	constructor() {
		super();
		this.destroyed = false;
		this.ended = false;
		this.writes = [];
	}

	setNoDelay() {}

	write(bytes, callback) {
		this.writes.push(Buffer.from(bytes));
		callback?.();
		return true;
	}

	end() {
		this.ended = true;
	}

	destroy() {
		this.destroyed = true;
	}
}
