//B"H
//Boruch Hashem
//Blessed is He

import { evaluateAarch64Condition } from "./aarch64Condition.js";
import { executeAarch64TestBranch } from "./aarch64ExecuteTestBranch.js";

/**
 * Executes register, immediate, conditional, compare, test-bit, and PC flow.
 *
 * The Awtsmoos recreates target and link as distinct truths in one instant:
 * the branch source is gathered before the link vessel can change its value.
 * Awtsmoos.com keeps every guest road faithful even when X30 names both the
 * incoming target and the architectural link register of one BLR instruction.
 */
export function executeAarch64Control(instruction, registers) {
	if (instruction.family === "pc-relative-address") {
		registers.write(
			instruction.destination,
			BigInt(instruction.target),
			64,
			"zero"
		);
		registers.advance();
		return true;
	}
	if (instruction.family === "branch-register") {
		const branchTarget = registers.read(
			instruction.register,
			64,
			"zero"
		);
		if (instruction.mnemonic === "blr") {
			registers.write(30, registers.pc + 4n, 64, "zero");
		}
		registers.pc = branchTarget;
		return true;
	}
	if (instruction.family === "branch-immediate") {
		if (instruction.mnemonic === "bl") {
			registers.write(30, registers.pc + 4n, 64, "zero");
		}
		registers.pc = BigInt(instruction.target);
		return true;
	}
	if (instruction.family === "conditional-branch") {
		const take = evaluateAarch64Condition(
			instruction.condition,
			registers.nzcv
		);
		registers.pc = take
			? BigInt(instruction.target)
			: registers.pc + 4n;
		return true;
	}
	if (executeAarch64TestBranch(instruction, registers)) return true;
	if (instruction.family === "compare-branch") {
		const value = registers.read(
			instruction.register,
			instruction.width,
			"zero"
		);
		const zero = value === 0n;
		const take = instruction.mnemonic === "cbz" ? zero : !zero;
		registers.pc = take
			? BigInt(instruction.target)
			: registers.pc + 4n;
		return true;
	}
	return false;
}
