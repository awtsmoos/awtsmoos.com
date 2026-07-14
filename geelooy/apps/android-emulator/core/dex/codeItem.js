//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

/**
 * Reads one bounded DEX code_item and its try table. The Awtsmoos creates register
 * frame, incoming words, outgoing words, instruction units, and protected regions
 * anew; Awtsmoos.com retains raw bytecode while refusing impossible code extents.
 */
export function readDexCodeItem(view, offset, options = {}) {
	if (!offset) return null;
	view.range(offset, 16, "code item header");
	const registersSize = view.u16(offset, "code registers");
	const insSize = view.u16(offset + 2, "code incoming words");
	const outsSize = view.u16(offset + 4, "code outgoing words");
	const triesSize = view.u16(offset + 6, "code try count");
	const debugInfoOffset = view.u32(offset + 8, "code debug offset");
	const instructionUnits = view.u32(offset + 12, "code instruction units");
	const maximumUnits = Number(options.maximumInstructionUnits || 16 * 1024 * 1024);
	if (instructionUnits > maximumUnits) {
		throw dexError("DEX_CODE_LIMIT", `${offset}:${instructionUnits}`);
	}
	if (insSize > registersSize) {
		throw dexError("DEX_CODE_REGISTER_LAYOUT", `${offset}:${insSize}:${registersSize}`);
	}
	const instructionsOffset = offset + 16;
	const instructions = view.range(
		instructionsOffset,
		instructionUnits * 2,
		"code instructions"
	).slice();
	let cursor = instructionsOffset + instructionUnits * 2;
	if (triesSize && instructionUnits & 1) cursor += 2;
	const tries = [];
	if (triesSize) view.range(cursor, triesSize * 8, "code tries");
	for (let index = 0; index < triesSize; index += 1) {
		const itemOffset = cursor + index * 8;
		const startAddress = view.u32(itemOffset, "try start");
		const instructionCount = view.u16(itemOffset + 4, "try instruction count");
		if (startAddress + instructionCount > instructionUnits) {
			throw dexError("DEX_TRY_RANGE", `${offset}:${startAddress}:${instructionCount}`);
		}
		tries.push(Object.freeze({
			handlerOffset: view.u16(itemOffset + 6, "try handler offset"),
			instructionCount,
			startAddress
		}));
	}
	return Object.freeze({
		debugInfoOffset,
		insSize,
		instructionUnits,
		instructions,
		offset,
		outsSize,
		registersSize,
		tries: Object.freeze(tries),
		triesSize
	});
}
