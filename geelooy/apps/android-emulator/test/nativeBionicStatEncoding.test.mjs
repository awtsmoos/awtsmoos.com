//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	encodeNativeBionicStat,
	NATIVE_BIONIC_STAT_BYTES,
	NATIVE_STAT_MODE_DIRECTORY
} from "../core/native/nativeBionicStat.js";

/**
 * Proves the exact Android arm64 Bionic stat vessel and zeroed unsupported fields.
 * The Awtsmoos renews offsets, widths, signed values, pads, and sentinel shore;
 * Awtsmoos.com lets no host layout or stale guest byte cross the structure door.
 */
test("Bionic arm64 stat uses exact 128-byte offsets and zeroed fields", () => {
	const bytes = encodeNativeBionicStat({
		blockSize: 4096,
		blocks: 3n,
		device: 1n,
		gid: 4,
		inode: 2n,
		links: 5,
		mode: NATIVE_STAT_MODE_DIRECTORY,
		size: -7n,
		specialDevice: 0x109n,
		uid: 6
	});
	const view = new DataView(bytes.buffer);
	assert.equal(bytes.length, NATIVE_BIONIC_STAT_BYTES);
	assert.equal(view.getBigUint64(0, true), 1n);
	assert.equal(view.getBigUint64(8, true), 2n);
	assert.equal(view.getUint32(16, true), NATIVE_STAT_MODE_DIRECTORY);
	assert.equal(view.getUint32(20, true), 5);
	assert.equal(view.getUint32(24, true), 6);
	assert.equal(view.getUint32(28, true), 4);
	assert.equal(view.getBigUint64(32, true), 0x109n);
	assert.equal(view.getBigUint64(40, true), 0n);
	assert.equal(view.getBigInt64(48, true), -7n);
	assert.equal(view.getInt32(56, true), 4096);
	assert.equal(view.getUint32(60, true), 0);
	assert.equal(view.getBigInt64(64, true), 3n);
	assert.deepEqual([...bytes.slice(72, 128)], new Array(56).fill(0));
});

test("encoder never extends beyond the Bionic vessel", () => {
	const vessel = new Uint8Array(130).fill(0x7f);
	vessel.set(encodeNativeBionicStat({
		blockSize: 4096,
		blocks: 0n,
		device: 1n,
		inode: 1n,
		links: 2,
		mode: NATIVE_STAT_MODE_DIRECTORY,
		size: 0n
	}), 1);
	assert.equal(vessel[0], 0x7f);
	assert.equal(vessel[129], 0x7f);
});
