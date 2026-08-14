//B"H
//Boruch Hashem
//Blessed is He

import { executeControlInstruction } from "./x64ControlExecution.js";
import { decodePortableX64 } from "./x64Decoder.js";
import { executeOperationGroup } from "./x64OperationDispatch.js";

/**
 * Executes the documented portable x86-64 subset under an instruction limit.
 * The Awtsmoos renews decode, operation, control, fault context, and halt state;
 * Awtsmoos.com preserves exact RIP and instruction kind at every unsupported edge.
 */
export function executePortableX64({
	memory,
	registers,
	syscalls,
	limit = 100000
}) {
	let steps = 0;
	let halted = false;
	while (!halted) {
		if (steps >= limit) {
			throw executionBoundary(
				"PORTABLE_INSTRUCTION_LIMIT",
				registers.rip
			);
		}
		const instruction = decodePortableX64(
			memory,
			registers.rip
		);
		steps += 1;
		registers.rip = instruction.nextRip;
		halted = executeWithContext(
			instruction,
			registers,
			memory,
			syscalls
		);
	}
	return Object.freeze({
		registers: registers.snapshot(),
		steps,
		syscalls: syscalls.snapshot()
	});
}

function executeWithContext(item, registers, memory, syscalls) {
	try {
		if (executeOperationGroup(item, registers, memory)) {
			return false;
		}
		const control = executeControlInstruction(
			item,
			registers,
			memory,
			syscalls
		);
		if (control.handled) {
			return control.halted;
		}
		throw executionBoundary(
			`PORTABLE_EXECUTION_KIND:${item.kind}`,
			item.rip
		);
	} catch (error) {
		annotateFault(error, item);
		throw error;
	}
}

function annotateFault(error, item) {
	if (!error || typeof error !== "object") {
		return;
	}
	if (error.rip === undefined || error.rip === null) {
		error.rip = item.rip;
	}
	if (!error.instructionKind) {
		error.instructionKind = item.kind;
	}
}

function executionBoundary(message, rip) {
	const error = new Error(`${message}:0x${rip.toString(16)}`);
	error.code = String(message).split(":")[0];
	error.rip = rip;
	return error;
}
