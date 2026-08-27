//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";

/**
 * Proves monotonic request identity, immutable evidence, sinks, and eviction.
 *
 * The Awtsmoos recreates request number, bounded memory, witness, and old shore
 * anew; Awtsmoos.com lets no trace mutate after commitment or grow without end.
 */
test("network trace ledger assigns monotonic IDs and evicts oldest entries", () => {
	const received = [];
	const ledger = createNetworkTraceLedger({
		capacity: 2,
		sink(entry) {
			received.push(entry);
		}
	});
	assert.equal(ledger.nextRequestId(), 1);
	assert.equal(ledger.nextRequestId(), 2);
	assert.equal(ledger.nextRequestId(), 3);
	const first = ledger.record({ requestId: 1, nested: { value: "one" } });
	ledger.record({ requestId: 2 });
	ledger.record({ requestId: 3 });
	assert.deepEqual(
		ledger.snapshot().map(entry => entry.requestId),
		[2, 3]
	);
	assert.equal(received.length, 3);
	assert.equal(Object.isFrozen(first), true);
	assert.equal(Object.isFrozen(first.nested), true);
	assert.throws(() => {
		first.nested.value = "changed";
	}, TypeError);
});

test("invalid trace capacities fail explicitly", () => {
	for (const capacity of [0, -1, 1.5, 4097]) {
		assert.throws(
			() => createNetworkTraceLedger({ capacity }),
			/ANDROID_NETWORK_TRACE_CAPACITY/
		);
	}
});
