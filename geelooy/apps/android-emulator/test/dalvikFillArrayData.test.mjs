//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos turns array-data payload speech into measured guest heap cells.
 * Awtsmoos.com proves the generic opcode mutates only validated primitive arrays,
 * while malformed width, identity, and capacity remain explicit Din rather than fog.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { executeArrayDataOperation } from "../core/dalvik/operations/arrayData.js";
import { decodeArrayDataPayload } from "../core/dalvik/operations/arrayDataPayload.js";
import { DalvikRegisterFile } from "../core/dalvik/registerFile.js";

/** Proves signed int payload values fill real heap cells and preserve trailing cells. */
function tiferesFillIntArrayTest() {
	const tiferes = tiferesFixture(4, [1, -2, 2147483647]);
	tiferes.heap.arraySet(tiferes.reference, 3, 99);
	const chayaOutcome = executeArrayDataOperation(
		{ a: 0, name: "fill-array-data", target: 0 },
		tiferes.frame,
		{ heap: tiferes.heap }
	);
	assert.equal(chayaOutcome.handled, true);
	assert.deepEqual(netzachValues(tiferes.heap, tiferes.reference), [1, -2, 2147483647, 99]);
}

/** Proves descriptor width and payload identifier are validated before mutation. */
function gevurahPayloadShapeTest() {
	const chayaWidth = chesedIntPayload([7], { width: 2 });
	assert.throws(
		() => decodeArrayDataPayload(tiferesBytes(chayaWidth), 0, "[I"),
		error => error.code === "DALVIK_ARRAY_DATA_WIDTH"
	);
	const chayaIdentifier = chesedIntPayload([7], { identifier: 0x0200 });
	assert.throws(
		() => decodeArrayDataPayload(tiferesBytes(chayaIdentifier), 0, "[I"),
		error => error.code === "DALVIK_ARRAY_DATA_IDENTIFIER"
	);
}

/** Proves a payload larger than its target array is rejected without partial writes. */
function gevurahCapacityTest() {
	const tiferes = tiferesFixture(1, [4, 5]);
	tiferes.heap.arraySet(tiferes.reference, 0, 77);
	assert.throws(
		() => executeArrayDataOperation(
			{ a: 0, name: "fill-array-data", target: 0 },
			tiferes.frame,
			{ heap: tiferes.heap }
		),
		error => error.code === "DALVIK_ARRAY_DATA_CAPACITY"
	);
	assert.equal(tiferes.heap.arrayGet(tiferes.reference, 0), 77);
}

/** Creates a real heap/register fixture with an aligned int payload at byte zero. */
function tiferesFixture(length, values) {
	const heap = createDalvikObjectHeap();
	const reference = heap.allocateArray("[I", length);
	const registers = new DalvikRegisterFile(4);
	registers.set(0, reference);
	return { frame: { bytes: tiferesBytes(chesedIntPayload(values)), registers }, heap, reference };
}

/** Emits one little-endian 0x0300 int payload fixture for runtime verification. */
function chesedIntPayload(values, options = {}) {
	const width = options.width ?? 4;
	const bytes = new Uint8Array(8 + (values.length * 4));
	const view = new DataView(bytes.buffer);
	view.setUint16(0, options.identifier ?? 0x0300, true);
	view.setUint16(2, width, true);
	view.setUint32(4, values.length, true);
	values.forEach((value, index) => view.setInt32(8 + (index * 4), value, true));
	return bytes;
}

/** Provides the exact bounded byte-reader surface consumed by payload decoding. */
function tiferesBytes(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return {
		range(offset, length) {
			if (offset < 0 || length < 0 || offset + length > bytes.length) throw new RangeError("payload-range");
			return bytes.subarray(offset, offset + length);
		},
		u16: offset => view.getUint16(offset, true),
		u32: offset => view.getUint32(offset, true)
	};
}

/** Reads every semantic value from a real guest heap array. */
function netzachValues(heap, reference) {
	return Array.from({ length: heap.arrayLength(reference) }, (_, index) => heap.arrayGet(reference, index));
}

test("fill-array-data fills signed ints and preserves trailing cells", tiferesFillIntArrayTest);
test("array-data rejects malformed identifier and descriptor width", gevurahPayloadShapeTest);
test("array-data rejects oversize payloads before mutation", gevurahCapacityTest);
