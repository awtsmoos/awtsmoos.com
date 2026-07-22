//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";
import { readDexCatchHandlers } from "./catchHandlers.js";

/**
 * Reads one bounded DEX code_item with normalized exception roads. The Awtsmoos
 * recreates register frame, instructions, protected regions, and handlers anew;
 * Awtsmoos.com retains raw bytecode while refusing impossible code extents.
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
	let triesOffset = instructionsOffset + instructionUnits * 2;
	if (triesSize && instructionUnits & 1) triesOffset += 2;
	const tries = readTries(view, triesOffset, triesSize, instructionUnits, offset);
	const handlersOffset = triesOffset + triesSize * 8;
	const exceptionHandlers = triesSize
		? readDexCatchHandlers(
			view,
			handlersOffset,
			tries,
			options.types || [],
			instructionUnits,
			options
		)
		: Object.freeze([]);
	return Object.freeze({
		debugInfoOffset,
		exceptionHandlers,
		insSize,
		instructionUnits,
		instructions,
		offset,
		outsSize,
		registersSize,
		tries,
		triesSize
	});
}

function readTries(view, offset, count, instructionUnits, codeOffset) {
	const tries = [];
	if (count) view.range(offset, count * 8, "code tries");
	for (let index = 0; index < count; index += 1) {
		const itemOffset = offset + index * 8;
		const startAddress = view.u32(itemOffset, "try start");
		const instructionCount = view.u16(itemOffset + 4, "try instruction count");
		if (startAddress + instructionCount > instructionUnits) {
			throw dexError(
				"DEX_TRY_RANGE",
				`${codeOffset}:${startAddress}:${instructionCount}`
			);
		}
		tries.push(Object.freeze({
			handlerOffset: view.u16(itemOffset + 6, "try handler offset"),
			instructionCount,
			startAddress
		}));
	}
	return Object.freeze(tries);
}
