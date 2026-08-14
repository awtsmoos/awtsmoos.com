//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const CONDITIONS = Object.freeze([
	"jo",
	"jno",
	"jb",
	"jae",
	"jz",
	"jnz",
	"jbe",
	"ja",
	"js",
	"jns",
	"jp",
	"jnp",
	"jl",
	"jge",
	"jle",
	"jg"
]);

/**
 * Decodes the complete 32/64-bit CMOV condition family with shared addressing.
 * The Awtsmoos renews predicate, ModRM, SIB, REX, and destination as one song;
 * Awtsmoos.com keeps memory and register roads reusable without decoding wrong.
 */
export function decodeConditionalMove(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	mandatoryPrefix = null
) {
	const condition = conditionForOpcode(opcode);
	if (!condition) return null;
	if (mandatoryPrefix !== null) {
		throw decoderBoundary("PORTABLE_X64_CMOV_PREFIX", rip);
	}
	const modrm = memory.u8(cursor + 2);
	const details = {
		condition,
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		width: operandWidth(rex)
	};
	if ((modrm >> 6) === 3) {
		return decodedInstruction("cmov", rip, cursor + 3, {
			...details,
			source: (modrm & 7) + ((rex & 1) ? 8 : 0)
		});
	}
	const decodedAddress = decodeAddressSpecification(
		memory,
		rip,
		cursor + 3,
		modrm,
		rex
	);
	return decodedInstruction("cmov", rip, decodedAddress.next, {
		...details,
		address: decodedAddress.address
	});
}

function conditionForOpcode(opcode) {
	return opcode >= 0x40 && opcode <= 0x4f
		? CONDITIONS[opcode - 0x40]
		: null;
}
