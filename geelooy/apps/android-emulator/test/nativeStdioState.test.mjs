//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeReadOnlyFiles } from "../core/native/nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "../core/native/nativeReadOnlyFileStreams.js";
import { createNativeStdioState } from "../core/native/nativeStdioState.js";

test("opaque external streams retain bounded output and status", () => {
	const stdio = createNativeStdioState();
	const stream = 0xabcdefn;
	assert.equal(stdio.write(stream, new TextEncoder().encode("hello")), 5);
	assert.equal(stdio.fileno(stream), -1);
	assert.equal(stdio.error(stream), false);
	assert.equal(stdio.snapshot().find(item => item.pointer === stream.toString()).text, "hello");
	assert.equal(stdio.close(stream), 0);
	assert.equal(stdio.write(stream, Uint8Array.of(1)), 0);
	assert.equal(stdio.error(stream), true);
});

test("package streams support reads, EOF, descriptors, and read-only errors", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const files = createNativeReadOnlyFiles({ platformFiles: { "/a": "abc" } });
	const streams = createNativeReadOnlyFileStreams({ files, heap });
	const stdio = createNativeStdioState({ fileStreams: streams });
	const pointer = streams.open("/a", "rb");
	assert.deepEqual([...stdio.read(pointer, 2)], [97, 98]);
	assert.equal(stdio.eof(pointer), false);
	assert.deepEqual([...stdio.read(pointer, 2)], [99]);
	assert.equal(stdio.eof(pointer), true);
	assert.equal(stdio.fileno(pointer), 3);
	assert.equal(stdio.write(pointer, Uint8Array.of(1)), 0);
	assert.equal(stdio.error(pointer), true);
	assert.equal(stdio.close(pointer), 0);
});
