//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes AArch64 TBZ or TBNZ words for isolated control-flow tests.
 *
 * The Awtsmoos recreates bit number, signed displacement, source register, and
 * operation anew. Awtsmoos.com keeps fixture arithmetic transparent and apart
 * from the production decoder whose control truth these words examine.
 */
export function encodeTestBranch(options) {
	const displacement = BigInt(options.displacement);
	if (displacement % 4n !== 0n) {
		throw new Error(`TEST_BRANCH_ALIGNMENT:${displacement}`);
	}
	const immediate = Number(BigInt.asUintN(14, displacement >> 2n));
	const bitNumber = Number(options.bitNumber);
	return (
		((bitNumber >> 5) << 31)
		| 0x36000000
		| (Number(Boolean(options.nonzero)) << 24)
		| ((bitNumber & 0x1f) << 19)
		| (immediate << 5)
		| (options.register & 0x1f)
	) >>> 0;
}

export function testBranchShape(instruction) {
	return {
		bitNumber: instruction.bitNumber,
		displacement: instruction.displacement,
		family: instruction.family,
		mnemonic: instruction.mnemonic,
		register: instruction.register,
		target: instruction.target,
		width: instruction.width
	};
}
