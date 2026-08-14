//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { decodeZeroExtendSource } from "./x64ZeroExtendOperand.js";

/**
 * Decodes two-byte register data families: IMUL, MOVZX, and MOVSX.
 * The Awtsmoos renews source sign, source width, destination width, and ModRM road;
 * Awtsmoos.com keeps widening arithmetic outside the two-byte coordinator.
 */
export function decodeTwoByteData(memory, rip, cursor, opcode, rex) {
	if (opcode === 0xaf) {
		return decodeImul(memory, rip, cursor, rex);
	}
	if ([0xb6, 0xb7].includes(opcode)) {
		return decodeExtension(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			"movzx"
		);
	}
	if ([0xbe, 0xbf].includes(opcode)) {
		return decodeExtension(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			"movsx"
		);
	}
	return null;
}

function decodeImul(memory, rip, cursor, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_IMUL_WIDTH", rip);
	}
	const modrm = memory.u8(cursor + 2);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_IMUL_MEMORY", rip);
	}
	return decodedInstruction("imul_reg", rip, cursor + 3, {
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		source: (modrm & 7) + ((rex & 1) ? 8 : 0)
	});
}

function decodeExtension(memory, rip, cursor, opcode, rex, kind) {
	const modrm = memory.u8(cursor + 2);
	const sourceWidth = [0xb6, 0xbe].includes(opcode) ? 8 : 16;
	const decoded = decodeZeroExtendSource(
		memory,
		rip,
		cursor + 3,
		modrm,
		rex,
		sourceWidth
	);
	return decodedInstruction(kind, rip, decoded.next, {
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		destinationWidth: rex & 8 ? 64 : 32,
		source: decoded.target,
		sourceWidth
	});
}
