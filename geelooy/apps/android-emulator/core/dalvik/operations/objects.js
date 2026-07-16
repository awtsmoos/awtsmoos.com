//B"H
//Boruch Hashem
//Blessed is He

import {
	checkDalvikCast,
	isDalvikInstance
} from "./objectTypeChecks.js";

/**
 * Executes Dalvik object and array allocation, type checks, lengths, and indexed
 * access. The Awtsmoos creates reference, String literal, class garment, and cell
 * anew; Awtsmoos.com delegates type proof to an isolated bounded module.
 */
export function executeObjectOperation(instruction, frame, context) {
	const registers = frame.registers;
	if (instruction.name === "new-instance") {
		registers.set(
			instruction.a,
			context.heap.allocate(
				pool(context.model.types, instruction.index, "type")
			)
		);
		return handled();
	}
	if (instruction.name === "new-array") {
		registers.set(
			instruction.a,
			context.heap.allocateArray(
				pool(context.model.types, instruction.index, "type"),
				registers.get(instruction.b)
			)
		);
		return handled();
	}
	if (instruction.name === "array-length") {
		registers.set(
			instruction.a,
			context.heap.arrayLength(registers.get(instruction.b))
		);
		return handled();
	}
	if (instruction.name === "check-cast") {
		checkDalvikCast(
			registers.get(instruction.a),
			pool(context.model.types, instruction.index, "type"),
			context,
			instruction
		);
		return handled();
	}
	if (instruction.name === "instance-of") {
		registers.set(
			instruction.a,
			isDalvikInstance(
				registers.get(instruction.b),
				pool(context.model.types, instruction.index, "type"),
				context
			) ? 1 : 0
		);
		return handled();
	}
	if (instruction.name.startsWith("aget")) {
		registers.set(
			instruction.a,
			context.heap.arrayGet(
				registers.get(instruction.b),
				registers.get(instruction.c)
			)
		);
		return handled();
	}
	if (instruction.name.startsWith("aput")) {
		context.heap.arraySet(
			registers.get(instruction.b),
			registers.get(instruction.c),
			registers.get(instruction.a)
		);
		return handled();
	}
	return null;
}

function pool(values, index, label) {
	if (!Number.isInteger(index) || index < 0 || index >= values.length) {
		const error = new Error(
			`DALVIK_POOL_INDEX:${label}:${index}:${values.length}`
		);
		error.code = "DALVIK_POOL_INDEX";
		throw error;
	}
	return values[index];
}

function handled() {
	return Object.freeze({ handled: true });
}
