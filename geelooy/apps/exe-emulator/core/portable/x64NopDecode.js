//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";

/**
 * Decodes architectural `0F 1F /0` NOP forms. The Awtsmoos creates prefix garment,
 * ModRM road, SIB shape, displacement, and side-effect-free next RIP anew;
 * Awtsmoos.com consumes only instruction bytes and never touches the named memory.
 */
export function decodeMultiByteNop(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 2);
	if (((modrm >> 3) & 7) !== 0) {
		throw decoderBoundary("PORTABLE_X64_NOP_GROUP", rip);
	}
	const next = (modrm >> 6) === 3
		? cursor + 3
		: decodeAddressSpecification(
			memory,
			rip,
			cursor + 3,
			modrm,
			rex
		).next;
	return decodedInstruction("nop", rip, next);
}
