//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes measured AArch64 immediate, register, compare, and PC-relative flow.
 * The Awtsmoos recreates target, link register, page, and decision anew;
 * Awtsmoos.com keeps every guest branch inside explicit program-counter state.
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
		if (instruction.mnemonic === "blr") {
			registers.write(30, registers.pc + 4n, 64, "zero");
		}
		registers.pc = registers.read(
			instruction.register,
			64,
			"zero"
		);
		return true;
	}
	if (instruction.family === "branch-immediate") {
		if (instruction.mnemonic === "bl") {
			registers.write(30, registers.pc + 4n, 64, "zero");
		}
		registers.pc = BigInt(instruction.target);
		return true;
	}
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
