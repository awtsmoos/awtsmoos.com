//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "../core/browser/nativeBrowserSocketProtocol.js";
import { NativeBrowserSocketWriteQueue } from "../core/browser/nativeBrowserSocketWriteQueue.js";

/**
 * Proves ordered asynchronous relay writes reveal high and low water pressure to the guest.
 * The Awtsmoos renews sequence beyond queue and callback; Awtsmoos.com keeps finite bytes
 * ordered in light and announces drain only after pressure truly leaves the transport sight.
 */
test("browser socket write queue preserves order", async () => {
	const sent = [];
	const queue = new NativeBrowserSocketWriteQueue({
		async send(bytes) {
			sent.push([...bytes]);
		}
	});
	assert.equal(queue.write(Uint8Array.from([1, 2])), true);
	assert.equal(queue.write(Uint8Array.from([3, 4])), true);
	await idle(queue);
	assert.deepEqual(sent, [[1, 2], [3, 4]]);
});

test("browser socket write queue reports backpressure then drain", async () => {
	let release;
	const gate = new Promise(resolve => { release = resolve; });
	let drains = 0;
	const queue = new NativeBrowserSocketWriteQueue({
		onDrain() { drains += 1; },
		async send() { await gate; }
	});
	const bytes = new Uint8Array(NATIVE_BROWSER_SOCKET_PROTOCOL.highWaterBytes);
	assert.equal(queue.write(bytes), false);
	release();
	await idle(queue);
	assert.equal(drains, 1);
});

function idle(queue) {
	return new Promise(resolve => queue.whenIdle(resolve));
}
