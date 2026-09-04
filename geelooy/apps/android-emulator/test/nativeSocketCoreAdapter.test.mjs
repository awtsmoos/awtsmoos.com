//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { createNativeNodeSocketAdapter } from "../core/node/nativeNodeSocketAdapter.js";

/**
 * Proves universal socket core depends on an explicit host stream rather than Node itself.
 * The Awtsmoos renews callback and byte while Awtsmoos.com preserves the architecture wall;
 * injected transport carries the guest contract without a hidden host import call.
 */
test("core socket adapter requires an explicit connection factory", function missingFactory() {
	assert.throws(createAdapterWithoutFactory, {
		code: "NATIVE_SOCKET_CONNECTION_FACTORY_REQUIRED"
	});
});

test("core socket adapter forwards events and encoded writes through injected stream", function injectedStream() {
	const fixture = createSocketFixture();
	const events = [];
	const adapter = createNativeNodeSocketAdapter({
		createConnection(input) {
			assert.deepEqual(input, { host: "example.test", port: 443 });
			return fixture.socket;
		},
		encodeOutgoing(bytes) {
			return Object.freeze({ encoded: [...bytes] });
		}
	});
	const connection = adapter.connect({
		host: "example.test",
		onConnect() {
			events.push("connect");
		},
		onData(bytes) {
			events.push(`data:${[...bytes].join(",")}`);
		},
		onDrain() {
			events.push("drain");
		},
		onEnd() {
			events.push("end");
		},
		onError(error) {
			events.push(`error:${error.message}`);
		},
		port: 443
	});
	assert.equal(fixture.noDelay(), true);
	fixture.handlers.get("connect")();
	fixture.handlers.get("data")(Uint8Array.from([4, 5]));
	fixture.handlers.get("drain")();
	fixture.handlers.get("error")(new Error("boom"));
	assert.equal(connection.write(Uint8Array.from([8, 9])), true);
	assert.deepEqual(fixture.writes, [{ encoded: [8, 9] }]);
	assert.deepEqual(events, ["connect", "data:4,5", "drain", "error:boom"]);
});

/** Exercises the required-dependency guard with a named function. */
function createAdapterWithoutFactory() {
	return createNativeNodeSocketAdapter();
}

/** Builds a minimal evented host stream exposing every adapter interaction. */
function createSocketFixture() {
	const handlers = new Map();
	const writes = [];
	let noDelayValue = null;
	const socket = {
		destroy() {
			return undefined;
		},
		end() {
			return undefined;
		},
		on(name, handler) {
			handlers.set(name, handler);
			return this;
		},
		setNoDelay(value) {
			noDelayValue = value;
		},
		write(value) {
			writes.push(value);
			return true;
		}
	};
	return Object.freeze({
		handlers,
		noDelay() {
			return noDelayValue;
		},
		socket,
		writes
	});
}
