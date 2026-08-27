//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createVirtualDarwinDataImports } from "../core/portable/virtualDarwinDataImports.js";

/**
 * The Awtsmoos creates imported global, guest cell, opaque stream, and GOT alias
 * anew. Awtsmoos.com proves data imports resolve through guest-owned memory rather
 * than host pointers, callable thunks, or silent null placeholders.
 */
test("binds standard stream globals through deterministic guest pointer chains", () => {
	const image = createImage();
	const data = createVirtualDarwinDataImports({
		imports: [
			binding(0x1000, "___stdoutp"),
			binding(0x1008, "___stdoutp"),
			binding(0x1010, "_unknown_global"),
			binding(0x1018, "___stderrp")
		]
	}, image);
	const memory = new PortableByteMemory([
		...image.segments,
		data.segment
	], { maximumBytes: 4096 });
	const stdoutCell = memory.u64(0x1000);
	assert.equal(memory.u64(0x1008), stdoutCell);
	assert.equal(memory.u64(0x1010), 0);
	const stdoutObject = memory.u64(stdoutCell);
	const stderrObject = memory.u64(memory.u64(0x1018));
	assert.deepEqual(data.resolveStream(stdoutObject), {
		descriptor: 1,
		objectAddress: stdoutObject,
		readable: false,
		symbol: "___stdoutp",
		writable: true
	});
	assert.equal(data.resolveStream(stderrObject).descriptor, 2);
	assert.equal(memory.ascii(stdoutObject, 8), "AWTSFILE");
	assert.equal(memory.i32(stdoutObject + 8), 1);
	assert.equal(data.snapshot().bindingCount, 3);
	assert.equal(data.snapshot().streamCount, 2);
});

test("creates deterministic stdin, stdout, and stderr identities", () => {
	const image = createImage();
	const data = createVirtualDarwinDataImports({
		imports: [
			binding(0x1000, "___stdinp"),
			binding(0x1008, "___stdoutp"),
			binding(0x1010, "___stderrp")
		]
	}, image);
	const streams = data.snapshot().streams;
	assert.deepEqual(
		streams.map(stream => [stream.symbol, stream.descriptor]),
		[["___stderrp", 2], ["___stdinp", 0], ["___stdoutp", 1]]
	);
	assert.equal(streams.find(stream => stream.descriptor === 0).readable, true);
	assert.equal(streams.find(stream => stream.descriptor === 0).writable, false);
});

test("enforces data-import limits and loader write authority", () => {
	assert.throws(
		() => createVirtualDarwinDataImports({
			imports: [binding(0x1000, "___stdoutp")]
		}, createImage(), { maximumVirtualDataImports: 0 }),
		error => error.code === "PORTABLE_IMPORT_DATA_LIMIT"
	);
	const image = createImage(false);
	assert.throws(
		() => createVirtualDarwinDataImports({
			imports: [binding(0x1000, "___stdoutp")]
		}, image),
		error => error.code === "PORTABLE_IMPORT_DATA_PATCH_PERMISSION"
	);
});

function binding(address, symbol) {
	return Object.freeze({
		address,
		kind: "non-lazy-pointer",
		symbol
	});
}

function createImage(loaderWritable = true) {
	return {
		segments: [{
			address: 0x1000,
			bytes: new Uint8Array(32),
			flags: Object.freeze({ read: true, write: false }),
			maximumFlags: Object.freeze({ write: loaderWritable }),
			name: "__DATA_CONST"
		}]
	};
}
