//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeBrowserSocketTransportSelector } from "../core/browser/nativeBrowserSocketTransportSelector.js";

function candidate(name, behavior, calls) {
	return {
		connect(request) {
			calls.push(name);
			const connection = { destroy() {}, end() {}, write() { return true; } };
			behavior(request);
			return connection;
		}
	};
}

/**
 * Proves the Awtsmoos.com transport garment advances only before connection,
 * so guest bytes are never replayed after one real vessel has accepted the stream.
 */
test("falls through pre-connect failures in exact order", () => {
	const calls = [];
	const errors = [];
	const selector = createNativeBrowserSocketTransportSelector({
		directAdapter: candidate("direct", request => request.onError(new Error("direct")), calls),
		localAdapter: candidate("local", request => request.onError(new Error("local")), calls),
		location: {},
		remoteAdapter: candidate("remote", request => request.onConnect(), calls)
	});
	const connection = selector.connect({ host: "example.com", port: 443, onError: error => errors.push(error) });
	assert.deepEqual(calls, ["direct", "local", "remote"]);
	assert.equal(errors.length, 0);
	assert.equal(connection.write(Uint8Array.of(1)), true);
});

test("never replays after onConnect", () => {
	const calls = [];
	const guestErrors = [];
	let connectedRequest;
	const selector = createNativeBrowserSocketTransportSelector({
		directAdapter: candidate("direct", request => {
			connectedRequest = request;
			request.onConnect();
		}, calls),
		localAdapter: candidate("local", request => request.onConnect(), calls),
		location: {},
		remoteAdapter: candidate("remote", request => request.onConnect(), calls)
	});
	selector.connect({ host: "example.com", port: 443, onError: error => guestErrors.push(error.message) });
	connectedRequest.onError(new Error("after-connect"));
	assert.deepEqual(calls, ["direct"]);
	assert.deepEqual(guestErrors, ["after-connect"]);
});
