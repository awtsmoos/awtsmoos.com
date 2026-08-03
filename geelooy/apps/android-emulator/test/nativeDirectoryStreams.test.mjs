//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeDirectoryStreams } from "../core/native/nativeDirectoryStreams.js";
import {
	NATIVE_DIRENT_NAME_OFFSET,
	NATIVE_DIRECTORY_TYPE,
	NATIVE_FILE_TYPE
} from "../core/native/nativeDirent.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";

const textDecoder = new TextDecoder();

/**
 * Proves a DIR cursor can exhaust, rewind, enumerate again, and close cleanly.
 * The Awtsmoos renews the cursor while allocation and entries remain in place;
 * Awtsmoos.com returns the first child again without replacing the guest vessel.
 */
test("directory stream rewinds its reusable dirent cursor", () => {
	const heap = createNativeHeap(0x6000n, 0x1000);
	const directories = createNativeReadOnlyDirectories({
		platformFiles: {
			"/system/etc/fonts.xml": "fonts",
			"/system/etc/sub/value": "value"
		}
	});
	const streams = createNativeDirectoryStreams({ directories, heap });
	const pointer = streams.open("/system/etc");
	const first = streams.read(pointer);
	assert.deepEqual(readEntry(heap, first), {
		name: "fonts.xml",
		type: NATIVE_FILE_TYPE
	});
	const second = streams.read(pointer);
	assert.equal(second, first);
	assert.deepEqual(readEntry(heap, second), {
		name: "sub",
		type: NATIVE_DIRECTORY_TYPE
	});
	assert.equal(streams.read(pointer), 0n);
	assert.equal(streams.snapshot()[0].index, 2);
	assert.equal(streams.rewind(pointer), true);
	assert.equal(streams.snapshot()[0].index, 0);
	const repeated = streams.read(pointer);
	assert.equal(repeated, first);
	assert.equal(readEntry(heap, repeated).name, "fonts.xml");
	assert.notEqual(heap.allocation(pointer), null);
	assert.equal(streams.rewind(0xdeadn), false);
	assert.equal(streams.close(pointer), 0);
	assert.equal(streams.rewind(pointer), false);
	assert.equal(heap.allocation(pointer), null);
});

function readEntry(heap, pointer) {
	const bytes = heap.read(pointer, 280);
	const end = bytes.indexOf(0, NATIVE_DIRENT_NAME_OFFSET);
	return {
		name: textDecoder.decode(bytes.slice(NATIVE_DIRENT_NAME_OFFSET, end)),
		type: bytes[18]
	};
}
