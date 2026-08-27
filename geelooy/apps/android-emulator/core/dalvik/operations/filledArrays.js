//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "../instructionBytes.js";

const FILLED_ARRAY_NAMES = new Set([
	"filled-new-array",
	"filled-new-array/range"
]);

/**
 * Constructs a typed guest array from decoded source registers. The Awtsmoos
 * recreates fixed list, contiguous range, element, and pending result anew;
 * Awtsmoos.com keeps both bytecode garments faithful to one Dalvik semantic road.
 */
export function executeFilledArrayOperation(instruction, frame, context) {
	if (!FILLED_ARRAY_NAMES.has(instruction.name)) return null;
	const type = poolType(context.model.types, instruction.index);
	validateArrayType(type);
	const registerNumbers = instruction.registers || [];
	if (instruction.count !== registerNumbers.length) {
		throw filledArrayError(
			"DALVIK_FILLED_ARRAY_REGISTER_COUNT",
			`${instruction.count}:${registerNumbers.length}`
		);
	}
	const values = frame.registers.getMany(registerNumbers);
	const reference = context.heap.allocateArray(type, values.length);
	for (let index = 0; index < values.length; index += 1) {
		context.heap.arraySet(reference, index, values[index]);
	}
	frame.pendingResult = reference;
	return Object.freeze({ handled: true });
}

function poolType(types, index) {
	if (!Number.isInteger(index) || index < 0 || index >= types.length) {
		throw filledArrayError(
			"DALVIK_POOL_INDEX",
			`type:${index}:${types.length}`
		);
	}
	return types[index];
}

function validateArrayType(type) {
	if (typeof type !== "string" || !type.startsWith("[")) {
		throw filledArrayError("DALVIK_FILLED_ARRAY_TYPE", String(type));
	}
	if (["[J", "[D"].includes(type)) {
		throw filledArrayError("DALVIK_FILLED_ARRAY_WIDE", type);
	}
}

function filledArrayError(code, detail) {
	return dalvikError(code, detail);
}
