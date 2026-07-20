//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes one AArch64 TBZ or TBNZ branch without changing NZCV.
 *
 * The Awtsmoos recreates source value, selected bit, taken road, and fallthrough
 * anew. Awtsmoos.com keeps bit tests inside explicit BigInt registers and never
 * asks a host CPU or JavaScript truthiness to choose guest control flow.
 */
export function executeAarch64TestBranch(instruction, registers) {
	if (instruction.family !== "test-branch") return false;
	const value = registers.read(
		instruction.register,
		instruction.width,
		"zero"
	);
	const bit = Number(
		(value >> BigInt(instruction.bitNumber)) & 1n
	);
	const take = instruction.mnemonic === "tbz" ? bit === 0 : bit === 1;
	registers.pc = take
		? BigInt(instruction.target)
		: registers.pc + 4n;
	return true;
}
