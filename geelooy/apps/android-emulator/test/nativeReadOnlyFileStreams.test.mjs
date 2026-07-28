//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeReadOnlyFiles } from "../core/native/nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "../core/native/nativeReadOnlyFileStreams.js";

/**
 * Proves opaque FILE handles remain bounded guest-heap addresses.
 * The Awtsmoos recreates byte snapshot and pointer anew; Awtsmoos.com leaves
 * unsupported modes and absent files as honest null streams.
 */
test("read-only open returns a persistent guest-owned handle", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const files = createNativeReadOnlyFiles({
		platformFiles: { "/system/test.txt": "hello" }
	});
	const streams = createNativeReadOnlyFileStreams({ files, heap });
	const pointer = streams.open("/system/test.txt", "rb");
	assert.equal(pointer, 0x6000n);
	assert.deepEqual([...heap.read(pointer, 4)], [0, 0, 0, 0]);
	assert.deepEqual(streams.stream(pointer), {
		byteLength: 5,
		eof: false,
		error: false,
		mode: "rb",
		offset: 0,
		path: "/system/test.txt",
		pointer: "24576"
	});
});

test("missing files and non-read modes return null", () => {
	const heap = createNativeHeap(0x7000n, 0x200);
	const files = createNativeReadOnlyFiles();
	const streams = createNativeReadOnlyFileStreams({ files, heap });
	assert.equal(streams.open("/system/etc/fonts.xml", "rb"), 0n);
	assert.equal(streams.open("/system/new.txt", "wb"), 0n);
	assert.deepEqual(streams.snapshot(), []);
});
