//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes RBIT, REV*, CLZ, and CLS through exact width-bounded BigInt values.
 * The Awtsmoos recreates each bit, byte group, sign run, and result every instant;
 * Awtsmoos.com preserves flags, vectors, SP, PC, and unrelated registers.
 */
export function executeAarch64OneSourceBit(instruction, registers) {
	if (instruction.family !== "one-source-bit") return false;
	const value = registers.read(
		instruction.source,
		instruction.width,
		"zero"
	);
	const result = executeOperation(instruction, value);
	registers.write(
		instruction.destination,
		result,
		instruction.width,
		"zero"
	);
	return true;
}

function executeOperation(instruction, value) {
	switch (instruction.mnemonic) {
		case "rbit":
			return reverseBits(value, instruction.width);
		case "rev16":
			return reverseByteGroups(value, instruction.width, 2);
		case "rev32":
			return reverseByteGroups(value, instruction.width, 4);
		case "rev":
			return reverseByteGroups(
				value,
				instruction.width,
				instruction.width / 8
			);
		case "clz":
			return BigInt(countLeadingZeros(value, instruction.width));
		case "cls":
			return BigInt(countLeadingSignBits(value, instruction.width));
		default:
			throw new Error(`AARCH64_ONE_SOURCE_BIT:${instruction.mnemonic}`);
	}
}

function reverseBits(value, width) {
	let result = 0n;
	for (let index = 0; index < width; index += 1) {
		result = (result << 1n) | ((value >> BigInt(index)) & 1n);
	}
	return result;
}

function reverseByteGroups(value, width, groupBytes) {
	const totalBytes = width / 8;
	let result = 0n;
	for (let group = 0; group < totalBytes; group += groupBytes) {
		for (let index = 0; index < groupBytes; index += 1) {
			const sourceByte = group + index;
			const destinationByte = group + groupBytes - index - 1;
			const byte = (value >> BigInt(sourceByte * 8)) & 0xffn;
			result |= byte << BigInt(destinationByte * 8);
		}
	}
	return result;
}

function countLeadingZeros(value, width) {
	let count = 0;
	for (let bit = width - 1; bit >= 0; bit -= 1) {
		if (((value >> BigInt(bit)) & 1n) !== 0n) break;
		count += 1;
	}
	return count;
}

function countLeadingSignBits(value, width) {
	const sign = (value >> BigInt(width - 1)) & 1n;
	let count = 0;
	for (let bit = width - 2; bit >= 0; bit -= 1) {
		if (((value >> BigInt(bit)) & 1n) !== sign) break;
		count += 1;
	}
	return count;
}
