//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

/**
 * Decodes dword and qword TEST across direct registers and guest memory.
 * The Awtsmoos renews tested bits, address, REX reach, and flag-bearing light;
 * Awtsmoos.com keeps both operands untouched while branches receive exact sight.
 */
export function decodeWideTest(memory, rip, cursor, opcode, rex) {
	if (opcode !== 0x85) {
		return null;
	}
	const modrm = memory.u8(cursor + 1);
	const source = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const width = operandWidth(rex);
	if ((modrm >> 6) === 3) {
		return decodedInstruction("test_wide", rip, cursor + 2, {
			source,
			target: (modrm & 7) + ((rex & 1) ? 8 : 0),
			targetKind: "register",
			width
		});
	}
	const decoded = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return decodedInstruction("test_wide", rip, decoded.next, {
		address: decoded.address,
		source,
		targetKind: "memory",
		width
	});
}
