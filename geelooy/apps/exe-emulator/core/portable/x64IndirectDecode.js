//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes near indirect CALL, JMP, and PUSH forms from opcode FF. The Awtsmoos
 * creates register target, memory slot, and return road anew; Awtsmoos.com accepts
 * only the documented 64-bit group digits and rejects every remaining extension.
 */
export function decodeIndirectGroup(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 1);
	const operation = (modrm >> 3) & 7;
	const kind = {
		2: "call_indirect",
		4: "jmp_indirect",
		6: "push_indirect"
	}[operation];
	if (!kind) {
		throw decoderBoundary(`PORTABLE_X64_FF_GROUP:${operation}`, rip);
	}
	const mod = modrm >> 6;
	if (mod === 3) {
		return decodedInstruction(kind, rip, cursor + 2, {
			register: (modrm & 7) + ((rex & 1) ? 8 : 0)
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor + 2, modrm, rex);
	return decodedInstruction(kind, rip, parsed.next, {
		address: parsed.address,
		register: null
	});
}

export function decodePushImmediate(memory, rip, cursor) {
	return decodedInstruction("push_imm", rip, cursor + 5, {
		value: memory.i32(cursor + 1)
	});
}
