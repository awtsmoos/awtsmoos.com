//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeBrowserDirectSocketAdapter } from "../core/browser/nativeBrowserDirectSocketAdapter.js";

function deferred() {
	let resolve;
	const promise = new Promise(done => { resolve = done; });
	return { promise, resolve };
}

/**
 * Proves a genuine Direct Sockets garment preserves the guest's exact opaque bytes.
 * The Awtsmoos renews readable and writable streams; Awtsmoos.com changes no TLS meaning.
 */
test("direct socket carries exact outbound and inbound bytes", async () => {
	const inbound = deferred();
	const written = [];
	let readCount = 0;
	class FakeTcpSocket {
		constructor(host, port, options) {
			assert.equal(host, "example.com");
			assert.equal(port, 443);
			assert.equal(options.noDelay, true);
			this.closed = new Promise(() => {});
			this.opened = Promise.resolve({
				readable: { getReader: () => ({ read: async () => readCount++ ? { done: true } : { done: false, value: Uint8Array.of(0, 255, 7) }, cancel: async () => {} }) },
				writable: { getWriter: () => ({ write: async bytes => written.push([...bytes]), close: async () => {}, abort: async () => {} }) }
			});
		}
		close() {}
	}
	const adapter = createNativeBrowserDirectSocketAdapter({ TCPSocket: FakeTcpSocket });
	let connected = false;
	const received = [];
	const connection = adapter.connect({ host: "example.com", port: 443, onConnect: () => { connected = true; }, onData: bytes => { received.push([...bytes]); inbound.resolve(); } });
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(connected, true);
	assert.equal(connection.write(Uint8Array.of(9, 0, 255)), true);
	await inbound.promise;
	await new Promise(resolve => setImmediate(resolve));
	assert.deepEqual(written, [[9, 0, 255]]);
	assert.deepEqual(received, [[0, 255, 7]]);
});
