//B"H
//Boruch Hashem
//Blessed is He

import { executeBranch } from "./x64Branches.js";
import { executeIndirectControl } from "./x64IndirectExecution.js";

/**
 * Executes stack, branch, call, return, and syscall control flow.
 * The Awtsmoos renews exact register bits, guest stack, doorway, and halt state;
 * Awtsmoos.com preserves all 64 bits across PUSH and POP without Number narrowing.
 */
export function executeControlInstruction(
	item,
	registers,
	memory,
	syscalls
) {
	if (item.kind === "nop") {
		return result(true, false);
	}
	if (executeIndirectControl(item, registers, memory)) {
		return result(true, false);
	}
	if (item.kind === "push") {
		registers.pushBigInt(registers.getUnsignedBigInt(item.register));
		return result(true, false);
	}
	if (item.kind === "push_imm") {
		registers.pushBigInt(BigInt.asUintN(64, BigInt(item.value)));
		return result(true, false);
	}
	if (item.kind === "pop") {
		registers.setBigInt(item.register, registers.popBigInt());
		return result(true, false);
	}
	if (item.kind === "call") {
		registers.push(item.nextRip);
		registers.rip = item.target;
		return result(true, false);
	}
	if (item.kind === "ret") {
		if (!registers.stackDepth) {
			return result(true, true);
		}
		registers.rip = registers.pop();
		return result(true, false);
	}
	if (executeBranch(item, registers)) {
		return result(true, false);
	}
	if (item.kind === "syscall") {
		const state = syscalls.handle(registers, memory);
		return result(true, Boolean(state.halted));
	}
	return result(false, false);
}

function result(handled, halted) {
	return Object.freeze({
		halted,
		handled
	});
}
