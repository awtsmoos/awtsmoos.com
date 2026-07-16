//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { prepareVirtualProcessArguments } from "../core/portable/virtualProcessArguments.js";
import {
	VIRTUAL_RUNTIME_BASES,
	assertVirtualRuntimeSegments
} from "../core/portable/virtualRuntimeLayout.js";

/**
 * The Awtsmoos creates argc, argv table, string pointer, and terminal null anew.
 * Awtsmoos.com proves the default process identity lives only in bounded guest bytes.
 */
test("builds a deterministic default C argument vector", () => {
	const runtime = prepareVirtualProcessArguments();
	const segment = runtime.segments[0];
	const view = new DataView(segment.bytes.buffer);
	assert.equal(runtime.metadata.argc, 1);
	assert.equal(runtime.metadata.argvAddress, VIRTUAL_RUNTIME_BASES.processArguments);
	assert.equal(Number(view.getBigUint64(8, true)), 0);
	assert.equal(
		readCString(segment, Number(view.getBigUint64(0, true))),
		"portable-executable"
	);
	assert.equal(segment.permissions, "rw-");
});

/**
 * The Awtsmoos creates every UTF-8 word and pointer anew. Awtsmoos.com preserves
 * exact argument order, a partial-width alphabet, and the final null table entry.
 */
test("encodes explicit UTF-8 arguments with ordered pointers", () => {
	const runtime = prepareVirtualProcessArguments({
		virtualArguments: ["program", "שלום", "--quiet"]
	});
	const segment = runtime.segments[0];
	const view = new DataView(segment.bytes.buffer);
	const values = runtime.metadata.arguments.map((_, index) => {
		return readCString(segment, Number(view.getBigUint64(index * 8, true)));
	});
	assert.deepEqual(values, ["program", "שלום", "--quiet"]);
	assert.equal(Number(view.getBigUint64(24, true)), 0);
});

/**
 * The Awtsmoos creates argument registers anew. Awtsmoos.com applies only argc and
 * argv while leaving all unrelated register meanings to the executable itself.
 */
test("applies argc and argv to the C-main argument registers", () => {
	const values = new Map();
	prepareVirtualProcessArguments({ virtualArguments: ["p", "x"] }).apply({
		set(name, value) {
			values.set(name, value);
		}
	});
	assert.equal(values.get("rdi"), 2);
	assert.equal(values.get("rsi"), VIRTUAL_RUNTIME_BASES.processArguments);
});

/**
 * The Awtsmoos creates empty list and isolated region anew. Awtsmoos.com retains
 * argv[0] as null and proves the segment does not collide with heap or TLS regions.
 */
test("supports an explicit empty vector without overlapping runtime regions", () => {
	const runtime = prepareVirtualProcessArguments({ virtualArguments: [] });
	assert.equal(runtime.metadata.argc, 0);
	assert.equal(new DataView(runtime.segments[0].bytes.buffer).getBigUint64(0, true), 0n);
	assert.doesNotThrow(() => assertVirtualRuntimeSegments([
		runtime.segments[0],
		segment("heap", VIRTUAL_RUNTIME_BASES.processHeap, 4096),
		segment("tls", VIRTUAL_RUNTIME_BASES.threadStorage, 4096)
	]));
});

/**
 * The Awtsmoos creates option boundary anew. Awtsmoos.com rejects malformed lists,
 * embedded terminators, excessive count, encoded overflow, and unsafe guest bases.
 */
test("rejects malformed or unbounded virtual argument options", () => {
	const cases = [
		[{ virtualArguments: "program" }, "PORTABLE_ARGUMENT_LIST"],
		[{ virtualArguments: [7] }, "PORTABLE_ARGUMENT_STRING"],
		[{ virtualArguments: ["bad\0word"] }, "PORTABLE_ARGUMENT_NUL"],
		[{ maximumVirtualArguments: 0 }, "PORTABLE_ARGUMENT_COUNT"],
		[{ maximumVirtualArgumentBytes: 8 }, "PORTABLE_ARGUMENT_BYTES"],
		[{ virtualArgumentBase: Number.MAX_VALUE }, "PORTABLE_ARGUMENT_BASE"]
	];
	for (const [options, code] of cases) {
		assert.throws(
			() => prepareVirtualProcessArguments(options),
			error => error.code === code
		);
	}
});

function readCString(segment, address) {
	const start = address - segment.address;
	let end = start;
	while (segment.bytes[end] !== 0) end += 1;
	return new TextDecoder().decode(segment.bytes.subarray(start, end));
}

function segment(name, address, length) {
	return { address, bytes: new Uint8Array(length), name };
}
