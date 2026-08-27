//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	retainNativeDescriptorRuntimeSnapshotSource,
	snapshotNativeDescriptorRuntime
} from "../core/native/nativeDescriptorRuntimeSnapshot.js";

/**
 * Proves descriptor testimony preserves collisions and consumes no readiness.
 * The Awtsmoos renews epoll watch, pipe byte, timer, flag, and entropy shore;
 * Awtsmoos.com lets each registry reveal truth while mutating nothing more.
 */
test("missing registries return one frozen empty descriptor shape", () => {
	const snapshot = snapshotNativeDescriptorRuntime({});
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(snapshot.epoll, []);
	assert.deepEqual(snapshot.flags, []);
	assert.deepEqual(snapshot.pipes, []);
	assert.deepEqual(snapshot.readOnly, { entropy: null, records: [] });
	assert.deepEqual(snapshot.timers, []);
	assert.deepEqual(snapshot.watchedEvents, []);
});

test("retained state preserves watches, collisions, and current readiness", () => {
	const registry = {};
	const source = createSource("alpha", 1);
	retainNativeDescriptorRuntimeSnapshotSource(registry, source);
	const snapshot = snapshotNativeDescriptorRuntime(registry);
	assert.equal(snapshot.epoll[0].descriptor, 0x40020000);
	assert.equal(snapshot.readOnly.records[0].descriptor, 0x40020000);
	assert.deepEqual(snapshot.watchedEvents, [{
		currentEvents: 3,
		data: "99",
		descriptor: 50,
		epollDescriptor: 0x40020000,
		readyEvents: 1,
		requestedEvents: 1
	}]);
	assert.equal(source.consumed, 0);
	assert.equal(snapshot.pipes[0].bufferedBytes, 4);
	assert.equal(snapshot.timers[0].generation, 2);
	assert.equal(snapshot.flags[0].descriptorFlags, 1);
});

test("registry identity isolates descriptor universes", () => {
	const first = {};
	const second = {};
	retainNativeDescriptorRuntimeSnapshotSource(first, createSource("first", 1));
	retainNativeDescriptorRuntimeSnapshotSource(second, createSource("second", 2));
	assert.equal(snapshotNativeDescriptorRuntime(first).pipes[0].id, "first");
	assert.equal(snapshotNativeDescriptorRuntime(second).pipes[0].id, "second");
});

function createSource(prefix, readyMask) {
	const source = {
		consumed: 0,
		descriptorEvents() {
			return readyMask | 2;
		},
		descriptorFlags: snapshotter([{ descriptor: 50, descriptorFlags: 1 }]),
		epollState: snapshotter([{
			descriptor: 0x40020000,
			watches: [{ data: 99n, descriptor: 50, events: 1 }]
		}]),
		pipes: snapshotter([{ bufferedBytes: 4, id: prefix }]),
		readOnlyState: snapshotter({
			entropy: { bytesGenerated: "8" },
			records: [{ descriptor: 0x40020000, kind: "entropy" }]
		}),
		timers: snapshotter([{ descriptor: 60, generation: 2 }])
	};
	return source;
}

function snapshotter(value) {
	return Object.freeze({ snapshot: () => Object.freeze(value) });
}
