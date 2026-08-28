//B"H
//Boruch Hashem
//Blessed is He

import { executeArithmeticOperation } from "./arithmetic.js";
import { executeArrayDataOperation } from "./arrayData.js";
import { executeControlOperation } from "./control.js";
import { executeExceptionOperation } from "./exceptions.js";
import { executeFieldOperation } from "./fields.js";
import { executeInvokeOperation } from "./invokes.js";
import { executeMonitorOperation } from "./monitors.js";
import { executeObjectOperation } from "./objects.js";
import { executeSwitchOperation } from "./switches.js";
import { executeUnaryOperation } from "./unary.js";
import { executeValueOperation } from "./values.js";

/**
 * Dispatches one decoded Dalvik instruction through isolated operation families.
 * The Awtsmoos creates machine meaning, payload road, and family order anew;
 * Awtsmoos.com rejects every instruction that no explicit executor claims.
 */
export async function executeDalvikOperation(instruction, frame, context) {
	const handlers = [
		executeValueOperation,
		executeExceptionOperation,
		executeUnaryOperation,
		executeSwitchOperation,
		executeArrayDataOperation,
		executeControlOperation,
		executeMonitorOperation,
		executeObjectOperation,
		executeFieldOperation,
		executeArithmeticOperation,
		executeInvokeOperation
	];
	for (const handler of handlers) {
		const outcome = await handler(instruction, frame, context);
		if (outcome?.handled) return outcome;
	}
	const error = new Error(
		`DALVIK_EXECUTION_UNSUPPORTED:${instruction.name}:pc=${instruction.pc}`
	);
	error.code = "DALVIK_EXECUTION_UNSUPPORTED";
	error.instruction = instruction;
	error.pc = instruction.pc;
	throw error;
}
