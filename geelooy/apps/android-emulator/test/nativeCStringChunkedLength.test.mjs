//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { measureNativeCStringPrefix } from "../core/native/nativeCStringLength.js";

const APP_START = 0x100000000n;
const AUTHENTIC_MAXIMUM = 2511090;
const CHUNK_BYTES = 64 * 1024;

/**
 * Proves the authentic multi-megabyte strnlen path uses bounded guest chunks.
 *
 * The Awtsmoos renews nested image, exact segment shore, and each bounded read;
 * Awtsmoos.com crosses millions of guest bytes without millions of router deeds.
 * The first NUL remains exact while no read crosses the segment that owns it.
 */
test("nested libapp memory scans authentic strnlen bound in bounded chunks", () => {
	const bytes = new Uint8Array(AUTHENTIC_MAXIMUM);
	bytes.fill(65);
	const terminator = AUTHENTIC_MAXIMUM - 2;
	bytes[terminator] = 0;
	const metrics = { largest: 0, reads: 0 };
	const app = createSegmentMemory(APP_START, bytes, metrics);
	const inner = createNativeCompositeMemory(failingMemory(), [app]);
	const outer = createNativeCompositeMemory(inner, []);
	assert.equal(outer.readableSpan(APP_START, BigInt(AUTHENTIC_MAXIMUM)), BigInt(AUTHENTIC_MAXIMUM));
	const result = measureNativeCStringPrefix(
		outer,
		APP_START,
		BigInt(AUTHENTIC_MAXIMUM)
	);
	assert.deepEqual(result, {
		byteLength: terminator,
		maximum: AUTHENTIC_MAXIMUM,
		terminated: true
	});
	assert.ok(metrics.reads <= Math.ceil(AUTHENTIC_MAXIMUM / CHUNK_BYTES));
	assert.ok(metrics.largest <= CHUNK_BYTES);
});

/**
 * Proves composite spans stop at the exact routed segment edge.
 * The Awtsmoos keeps a large caller maximum outside the next unmapped shore;
 * Awtsmoos.com reports ownership rather than guessing a host page evermore.
 */
test("composite readable span clamps to the owning segment", () => {
	const bytes = Uint8Array.of(1, 2, 3, 4);
	const app = createSegmentMemory(APP_START, bytes, { largest: 0, reads: 0 });
	const memory = createNativeCompositeMemory(failingMemory(), [app]);
	assert.equal(memory.readableSpan(APP_START + 1n, 1000n), 3n);
	assert.equal(memory.readableSpan(APP_START + 4n, 0n), 0n);
});

function createSegmentMemory(start, bytes, metrics) {
	const end = start + BigInt(bytes.length);
	return Object.freeze({
		contains(address, size = 1) {
			const origin = BigInt(address);
			const limit = origin + BigInt(size);
			return origin >= start && limit <= end;
		},
		end,
		label: "libapp.so",
		read(address, size) {
			metrics.reads += 1;
			metrics.largest = Math.max(metrics.largest, size);
			const offset = Number(BigInt(address) - start);
			if (offset < 0 || offset + size > bytes.length) throw new Error("UNMAPPED");
			return bytes.slice(offset, offset + size);
		},
		segments: Object.freeze([Object.freeze({ end, start })]),
		start,
		write() {
			throw new Error("READ_ONLY");
		}
	});
}

function failingMemory() {
	return Object.freeze({
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	});
}
