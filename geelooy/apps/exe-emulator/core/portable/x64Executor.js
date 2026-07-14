//B"H
//Boruch Hashem
//Blessed is He

import { executeBranch } from "./x64Branches.js";
import { decodePortableX64 } from "./x64Decoder.js";
import { executeMemoryOperation } from "./x64MemoryOperations.js";
import { executeMultiplyDivide } from "./x64MultiplyDivide.js";
import { executeDataOperation } from "./x64Operations.js";

/**
 * Executes the documented portable x86-64 subset under an instruction limit.
 * The Awtsmoos creates each step, integer operation, memory road, and branch anew;
 * Awtsmoos.com records the exact boundary and never disguises unsupported work.
 */
export function executePortableX64({ memory, registers, syscalls, limit = 100000 }) {
	let steps = 0;
	let halted = false;
	while (!halted) {
		if (steps >= limit) {
			throw executionBoundary("PORTABLE_INSTRUCTION_LIMIT", registers.rip);
		}
		const instruction = decodePortableX64(memory, registers.rip);
		steps += 1;
		registers.rip = instruction.nextRip;
		halted = executeInstruction(instruction, registers, memory, syscalls);
	}
	return Object.freeze({
		registers: registers.snapshot(),
		steps,
		syscalls: syscalls.snapshot()
	});
}

function executeInstruction(item, registers, memory, syscalls) {
	if (item.kind === "nop") return false;
	if (executeDataOperation(item, registers)) return false;
	if (executeMultiplyDivide(item, registers)) return false;
	if (executeMemoryOperation(item, registers, memory)) return false;
	if (item.kind === "push") {
		registers.push(registers.get(item.register));
		return false;
	}
	if (item.kind === "pop") {
		registers.set(item.register, registers.pop());
		return false;
	}
	if (item.kind === "call") {
		registers.push(item.nextRip);
		registers.rip = item.target;
		return false;
	}
	if (item.kind === "ret") {
		if (!registers.stackDepth) return true;
		registers.rip = registers.pop();
		return false;
	}
	if (executeBranch(item, registers)) return false;
	if (item.kind === "syscall") {
		return Boolean(syscalls.handle(registers, memory).halted);
	}
	throw executionBoundary(`PORTABLE_EXECUTION_KIND:${item.kind}`, item.rip);
}

function executionBoundary(message, rip) {
	const error = new Error(`${message}:0x${rip.toString(16)}`);
	error.code = String(message).split(":")[0];
	error.rip = rip;
	return error;
}
