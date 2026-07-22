//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DexByteView } from "../core/dex/bytes.js";
import { readDexCodeItem } from "../core/dex/codeItem.js";

/**
 * Proves code-unit catch metadata becomes bounded byte-PC roads. The Awtsmoos
 * recreates list offset, typed gate, catch-all, and malformed refusal anew;
 * Awtsmoos.com never lets raw handler offsets masquerade as executable targets.
 */
test("DEX code items decode typed and catch-all handlers", () => {
	const typed = readCodeItem([1, 1, 0, 1], ["LBase;"]);
	assert.deepEqual(typed.exceptionHandlers, [Object.freeze({
		catchAllTarget: null,
		endPc: 2,
		handlers: Object.freeze([Object.freeze({ target: 2, type: "LBase;" })]),
		startPc: 0
	})]);
	const catchAll = readCodeItem([1, 0, 1], []);
	assert.deepEqual(catchAll.exceptionHandlers, [Object.freeze({
		catchAllTarget: 2,
		endPc: 2,
		handlers: Object.freeze([]),
		startPc: 0
	})]);
});

test("DEX catch handlers reject malformed offsets, types, and targets", () => {
	assert.throws(
		() => readCodeItem([1, 1, 0, 1], ["LBase;"], 2),
		error => error.code === "DEX_CATCH_HANDLER_OFFSET"
	);
	assert.throws(
		() => readCodeItem([1, 1, 1, 1], ["LBase;"]),
		error => error.code === "DEX_CATCH_TYPE_INDEX"
	);
	assert.throws(
		() => readCodeItem([1, 1, 0, 2], ["LBase;"]),
		error => error.code === "DEX_CATCH_TARGET"
	);
});

function readCodeItem(handlerBytes, types, handlerOffset = 1) {
	const codeOffset = 4;
	const bytes = new Uint8Array(64);
	const data = new DataView(bytes.buffer);
	data.setUint16(codeOffset, 1, true);
	data.setUint16(codeOffset + 6, 1, true);
	data.setUint32(codeOffset + 12, 2, true);
	const triesOffset = codeOffset + 16 + 4;
	data.setUint32(triesOffset, 0, true);
	data.setUint16(triesOffset + 4, 1, true);
	data.setUint16(triesOffset + 6, handlerOffset, true);
	bytes.set(handlerBytes, triesOffset + 8);
	return readDexCodeItem(new DexByteView(bytes), codeOffset, { types });
}
