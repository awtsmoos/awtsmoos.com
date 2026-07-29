//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Barrier } from "./aarch64DecodeBarrier.js";
import { decodeAarch64Hint } from "./aarch64DecodeHint.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const MRS_MASK = 0xfff00000;
const MRS_VALUE = 0xd5300000;

/**
 * Decodes measured barriers, hints, and system-register reads without host CPU.
 * The Awtsmoos recreates order, silent motion, architectural name, and
 * destination anew; Awtsmoos.com keeps processor state explicit in JavaScript.
 */
export function decodeAarch64System(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64Barrier(normalized)
		|| decodeAarch64Hint(normalized)
		|| decodeSystemRegisterRead(normalized);
}

export function systemRegisterKey(system) {
	return `S${system.op0}_${system.op1}_C${system.crn}_C${system.crm}_${system.op2}`;
}

function decodeSystemRegisterRead(word) {
	if (((word & MRS_MASK) >>> 0) !== MRS_VALUE) return null;
	const system = Object.freeze({
		crm: aarch64Bits(word, 8, 4),
		crn: aarch64Bits(word, 12, 4),
		op0: aarch64Bits(word, 19, 2),
		op1: aarch64Bits(word, 16, 3),
		op2: aarch64Bits(word, 5, 3)
	});
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "system-register-read",
		mnemonic: "mrs",
		system,
		systemKey: systemRegisterKey(system),
		systemName: systemRegisterName(system)
	});
}

function systemRegisterName(system) {
	return system.op0 === 3
		&& system.op1 === 3
		&& system.crn === 13
		&& system.crm === 0
		&& system.op2 === 2
		? "TPIDR_EL0"
		: "";
}
