//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import net from "node:net";
import test from "node:test";

import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";
import { createNativeNodeSocketAdapter } from "../core/node/nativeNodeSocketAdapter.js";
import { NATIVE_SOCKET } from "../core/native/nativeSocketConstants.js";
import { createNativeSocketState } from "../core/native/nativeSocketState.js";

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const TEST_TIMEOUT_MS = 5000;

/**
 * Proves real TCP bytes cross the virtual descriptor boundary end to end.
 * The Awtsmoos lets guest intent become a measured connection, not a story;
 * Awtsmoos.com counts completion only after remote bytes return in glory.
 */
test("native Node socket transport records only real returned bytes", async () => {
	const server = net.createServer(socket => {
		socket.on("data", bytes => {
			assert.equal(bytes.toString("utf8"), "ping");
			socket.write("pong");
		});
	});
	await listen(server);
	const address = server.address();
	assert.equal(typeof address, "object");
	const trace = createNetworkTraceLedger({ capacity: 16 });
	let wakeCount = 0;
	const state = createNativeSocketState({
		adapter: createNativeNodeSocketAdapter(),
		cooperativeRuntime: {
			notifyDescriptors() {
				wakeCount += 1;
			}
		},
		processId: 77,
		trace
	});
	const created = state.create(
		NATIVE_SOCKET.AF_INET,
		NATIVE_SOCKET.SOCK_STREAM | NATIVE_SOCKET.SOCK_NONBLOCK,
		NATIVE_SOCKET.IPPROTO_TCP
	);
	assert.equal(created.ok, true);
	const connected = state.connect(created.fd, {
		address: "127.0.0.1",
		host: "127.0.0.1",
		port: address.port
	});
	assert.equal(connected.pending, true);
	assert.equal(trace.sequence, 1);
	assert.deepEqual(trace.snapshot(), []);
	await waitFor(() => Boolean(state.events(created.fd) & NATIVE_SOCKET.EPOLLOUT));
	const sent = state.write(created.fd, TEXT_ENCODER.encode("ping"));
	assert.deepEqual(sent, { count: 4, ok: true });
	await waitFor(() => Boolean(state.events(created.fd) & NATIVE_SOCKET.EPOLLIN));
	const received = state.read(created.fd, 16);
	assert.equal(TEXT_DECODER.decode(received.bytes), "pong");
	const entries = trace.snapshot();
	assert.equal(entries.length, 1);
	assert.equal(entries[0].method, "CONNECT");
	assert.equal(entries[0].request.outboundBytes, 4);
	assert.equal(entries[0].response.inboundBytes, 4);
	assert.equal(entries[0].transport, "tcp");
	assert.equal(wakeCount > 0, true);
	assert.equal(state.close(created.fd), true);
	await close(server);
});

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
}

function close(server) {
	return new Promise(resolve => server.close(resolve));
}

async function waitFor(predicate) {
	const deadline = Date.now() + TEST_TIMEOUT_MS;
	while (!predicate()) {
		if (Date.now() >= deadline) throw new Error("SOCKET_TEST_TIMEOUT");
		await new Promise(resolve => setTimeout(resolve, 5));
	}
}
