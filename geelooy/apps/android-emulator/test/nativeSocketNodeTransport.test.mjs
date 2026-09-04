//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import net from "node:net";
import test from "node:test";

import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";
import { NATIVE_SOCKET } from "../core/native/nativeSocketConstants.js";
import { createNativeSocketState } from "../core/native/nativeSocketState.js";
import { createNativeNodeSocketAdapter } from "../node/nativeNodeSocketAdapter.js";

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const TEST_TIMEOUT_MS = 5000;

/**
 * Proves real TCP bytes cross the virtual descriptor boundary through the explicit Node host binding.
 * The Awtsmoos lets guest intent become a measured connection, not a story;
 * Awtsmoos.com counts completion only after remote bytes return in glory.
 */
test("native Node socket transport records only real returned bytes", async function socketProof() {
	const server = net.createServer(function onClient(socket) {
		socket.on("data", function onServerData(bytes) {
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
	await waitFor(function writable() {
		return Boolean(state.events(created.fd) & NATIVE_SOCKET.EPOLLOUT);
	});
	assert.deepEqual(state.write(created.fd, TEXT_ENCODER.encode("ping")), { count: 4, ok: true });
	await waitFor(function readable() {
		return Boolean(state.events(created.fd) & NATIVE_SOCKET.EPOLLIN);
	});
	const received = state.read(created.fd, 16);
	assert.equal(TEXT_DECODER.decode(received.bytes), "pong");
	const entries = trace.snapshot();
	assert.equal(entries.length, 1);
	assert.equal(entries[0].request.outboundBytes, 4);
	assert.equal(entries[0].response.inboundBytes, 4);
	assert.equal(entries[0].transport, "tcp");
	assert.equal(wakeCount > 0, true);
	assert.equal(state.close(created.fd), true);
	await close(server);
});

/** Starts the loopback proof server on an ephemeral local port. */
function listen(server) {
	return new Promise(function awaitListen(resolve, reject) {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
}

/** Closes the proof server after Node releases the listener. */
function close(server) {
	return new Promise(function awaitClose(resolve) {
		server.close(resolve);
	});
}

/** Polls one descriptor predicate with a bounded deterministic deadline. */
async function waitFor(predicate) {
	const deadline = Date.now() + TEST_TIMEOUT_MS;
	while (!predicate()) {
		if (Date.now() >= deadline) {
			throw new Error("SOCKET_TEST_TIMEOUT");
		}
		await delay(5);
	}
}

/** Yields briefly without hiding the timer callback in a compressed expression. */
function delay(milliseconds) {
	return new Promise(function awaitDelay(resolve) {
		setTimeout(resolve, milliseconds);
	});
}
