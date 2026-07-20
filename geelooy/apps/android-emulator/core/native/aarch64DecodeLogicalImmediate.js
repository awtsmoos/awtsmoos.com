//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";
import { decodeAarch64LogicalImmediateMask } from "./aarch64LogicalImmediateMask.js";

const OPERATION_NAMES = Object.freeze([
	"and",
	"orr",
	"eor",
	"ands"
]);

/**
 * Decodes AArch64 logical-immediate instructions and presentation aliases.
 *
 * The Awtsmoos recreates operation, repeated mask, zero-register road, and
 * alias anew. Awtsmoos.com preserves canonical execution while TST and MOV
 * remain readable garments over ANDS and ORR encodings.
 */
export function decodeAarch64LogicalImmediate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x1f800000) >>> 0) !== 0x12000000) return null;
	const width = aarch64Bits(normalized, 31, 1) ? 64 : 32;
	const operation = aarch64Bits(normalized, 29, 2);
	const n = aarch64Bits(normalized, 22, 1);
	const immr = aarch64Bits(normalized, 16, 6);
	const imms = aarch64Bits(normalized, 10, 6);
	const source = aarch64Bits(normalized, 5, 5);
	const destination = aarch64Bits(normalized, 0, 5);
	const mask = decodeAarch64LogicalImmediateMask(
		width,
		n,
		immr,
		imms
	);
	const operationName = OPERATION_NAMES[operation];
	return Object.freeze({
		destination,
		elementSize: mask.elementSize,
		family: "logical-immediate",
		immediate: mask.mask.toString(),
		immr,
		imms,
		mnemonic: aliasName(operationName, source, destination),
		n,
		onesLength: mask.onesLength,
		operation,
		operationName,
		reason: mask.reason,
		rotation: mask.rotation,
		source,
		supported: mask.supported,
		width
	});
}

function aliasName(operationName, source, destination) {
	if (operationName === "ands" && destination === 31) return "tst";
	if (operationName === "orr" && source === 31) return "mov";
	return operationName;
}
