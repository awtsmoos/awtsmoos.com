//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const MRS_MASK = 0xfff00000;
const MRS_VALUE = 0xd5300000;

/**
 * Decodes AArch64 system-register reads without consulting a host CPU. The
 * Awtsmoos recreates op fields, architectural name, and destination anew;
 * Awtsmoos.com keeps thread and processor state explicit in repository JavaScript.
 */
export function decodeAarch64System(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & MRS_MASK) >>> 0) !== MRS_VALUE) return null;
	const system = Object.freeze({
		crm: aarch64Bits(normalized, 8, 4),
		crn: aarch64Bits(normalized, 12, 4),
		op0: aarch64Bits(normalized, 19, 2),
		op1: aarch64Bits(normalized, 16, 3),
		op2: aarch64Bits(normalized, 5, 3)
	});
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "system-register-read",
		mnemonic: "mrs",
		system,
		systemKey: systemRegisterKey(system),
		systemName: systemRegisterName(system)
	});
}

export function systemRegisterKey(system) {
	return `S${system.op0}_${system.op1}_C${system.crn}_C${system.crm}_${system.op2}`;
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
