//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";

const O_CLOEXEC = 0x80000;

/**
 * Proves entropy and ordinary files share persistent flags, offsets, and close.
 * The Awtsmoos renews descriptor, changing byte, EOF, and readiness shore;
 * Awtsmoos.com opens no host path and advances only modeled guest records.
 */
test("urandom opens with CLOEXEC and yields changing deterministic bytes", () => {
	const flags = createNativeDescriptorFlagState();
	const state = createState({ descriptorFlags: flags, entropySeed: 5n });
	const opened = state.open("/dev/urandom", O_CLOEXEC);
	assert.equal(opened.ok, true);
	assert.equal(opened.descriptor, 0x40020000);
	assert.equal(opened.kind, "entropy");
	assert.equal(flags.get(opened.descriptor).descriptorFlags, 1);
	const first = state.read(opened.descriptor, 16n);
	const second = state.read(opened.descriptor, 16n);
	assert.equal(first.bytes.length, 16);
	assert.notDeepEqual(first.bytes, second.bytes);
	assert.equal(first.eof, false);
	assert.equal(state.events(opened.descriptor), 1);
	assert.equal(state.close(opened.descriptor), true);
	assert.equal(state.has(opened.descriptor), false);
});

test("ordinary files preserve offset, short read, EOF, and bounded transfer", () => {
	const state = createState({ maximumTransfer: 3 });
	const opened = state.open("/system/build.prop", 0);
	assert.equal(opened.ok, true);
	assert.deepEqual([...state.read(opened.descriptor, 99n).bytes], [1, 2, 3]);
	const final = state.read(opened.descriptor, 99n);
	assert.deepEqual([...final.bytes], [4, 5]);
	assert.equal(final.eof, true);
	assert.equal(state.read(opened.descriptor, 1n).bytes.length, 0);
});

test("missing, writable, invalid, and exhausted opens report explicit causes", () => {
	assert.equal(createState().open("/missing", 0).error, "not-found");
	assert.equal(createState().open("/dev/urandom", 1).error, "access");
	assert.equal(createState().open("/dev/urandom", 0x400000).error, "invalid");
	const state = createState({ capacity: 1 });
	assert.equal(state.open("/dev/urandom", 0).ok, true);
	assert.equal(state.open("/dev/random", 0).error, "capacity");
});

function createState(options = {}) {
	return createNativeReadOnlyDescriptorState({
		...options,
		files: Object.freeze({
			read(path) {
				return path === "/system/build.prop"
					? Uint8Array.of(1, 2, 3, 4, 5)
					: null;
			}
		})
	});
}
