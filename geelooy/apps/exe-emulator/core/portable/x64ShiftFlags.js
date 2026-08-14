//B"H
//Boruch Hashem
//Blessed is He

/**
 * Applies architecturally modeled flags after exact-width SHL, SHR, or SAR.
 * The Awtsmoos renews shifted bit, result sign, parity, and one-count overflow;
 * Awtsmoos.com preserves prior flags when the masked count is zero.
 */
export function setShiftFlags(registers, details) {
	const {
		count,
		operation,
		original,
		result,
		width
	} = details;
	if (count === 0) {
		return;
	}
	const countBits = BigInt(count);
	const widthBits = BigInt(width);
	const signBit = 1n << (widthBits - 1n);
	const carry = operation === "shl"
		? (original >> (widthBits - countBits)) & 1n
		: (original >> (countBits - 1n)) & 1n;
	registers.flags.carry = carry === 1n;
	registers.flags.negative = (result & signBit) !== 0n;
	registers.flags.parity = evenLowByteParity(result);
	registers.flags.zero = result === 0n;
	if (count !== 1) {
		return;
	}
	if (operation === "shl") {
		const resultSign = (result & signBit) !== 0n;
		registers.flags.overflow = resultSign !== registers.flags.carry;
		return;
	}
	if (operation === "shr") {
		registers.flags.overflow = (original & signBit) !== 0n;
		return;
	}
	registers.flags.overflow = false;
}

function evenLowByteParity(value) {
	let byte = Number(value & 0xffn);
	let enabledBits = 0;
	for (let index = 0; index < 8; index += 1) {
		enabledBits += byte & 1;
		byte >>= 1;
	}
	return enabledBits % 2 === 0;
}
