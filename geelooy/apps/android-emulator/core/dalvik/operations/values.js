//B"H
//Boruch Hashem
//Blessed is He

const INTEGER_CONSTANTS = new Set([
	"const/4",
	"const/16",
	"const"
]);
const WIDE_CONSTANTS = new Set([
	"const-wide/16",
	"const-wide/32",
	"const-wide"
]);

/**
 * Executes Dalvik moves, constants, strings, classes, and returns. The Awtsmoos
 * creates immediate, wide long, pool value, copied register, and departing result
 * anew; Awtsmoos.com preserves Java long values as signed 64-bit BigInts.
 */
export function executeValueOperation(instruction, frame, context) {
	const registers = frame.registers;
	if (isMove(instruction.name)) {
		registers.set(instruction.a, registers.get(instruction.b));
		return handled();
	}
	if (isMoveResult(instruction.name)) {
		registers.set(
			instruction.a,
			context.consumePendingResult(frame)
		);
		return handled();
	}
	if (INTEGER_CONSTANTS.has(instruction.name)) {
		registers.set(instruction.a, instruction.literal);
		return handled();
	}
	if (WIDE_CONSTANTS.has(instruction.name)) {
		registers.set(
			instruction.a,
			BigInt.asIntN(64, BigInt(instruction.literal))
		);
		return handled();
	}
	if (instruction.name === "const/high16") {
		registers.set(instruction.a, instruction.literal << 16);
		return handled();
	}
	if (instruction.name === "const-wide/high16") {
		const high = BigInt.asIntN(16, BigInt(instruction.literal));
		registers.set(instruction.a, BigInt.asIntN(64, high << 48n));
		return handled();
	}
	if (["const-string", "const-string/jumbo"].includes(instruction.name)) {
		registers.set(
			instruction.a,
			poolValue(context.model.strings, instruction.index, "string")
		);
		return handled();
	}
	if (instruction.name === "const-class") {
		registers.set(instruction.a, Object.freeze({
			descriptor: poolValue(
				context.model.types,
				instruction.index,
				"type"
			),
			kind: "dalvik-class"
		}));
		return handled();
	}
	if (instruction.name === "return-void") return returned(undefined);
	if (["return", "return-wide", "return-object"].includes(instruction.name)) {
		return returned(registers.get(instruction.a));
	}
	if (instruction.name === "nop") return handled();
	return null;
}

function isMove(name) {
	return [
		"move",
		"move/from16",
		"move/16",
		"move-wide",
		"move-wide/from16",
		"move-wide/16",
		"move-object",
		"move-object/from16",
		"move-object/16"
	].includes(name);
}

function isMoveResult(name) {
	return [
		"move-result",
		"move-result-wide",
		"move-result-object"
	].includes(name);
}

function poolValue(pool, index, label) {
	if (!Number.isInteger(index) || index < 0 || index >= pool.length) {
		const error = new Error(
			`DALVIK_POOL_INDEX:${label}:${index}:${pool.length}`
		);
		error.code = "DALVIK_POOL_INDEX";
		throw error;
	}
	return pool[index];
}

function handled() {
	return Object.freeze({ handled: true });
}

function returned(value) {
	return Object.freeze({ handled: true, returned: true, value });
}
