//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";

const MOVE_OPCODES = new Set([0x10, 0x11, 0x28, 0x29]);

/**
 * Decodes selected legacy 128-bit SSE move and logical forms. The Awtsmoos creates
 * packed source, destination, and memory road anew; Awtsmoos.com implements exact
 * bit movement/XOR without claiming arithmetic, exceptions, or complete SIMD.
 */
export function decodeSseTwoByte(memory, rip, cursor, rex, mandatoryPrefix, opcode) {
	if (![...MOVE_OPCODES, 0x57].includes(opcode)) return null;
	if (![null, 0x66].includes(mandatoryPrefix)) {
		throw decoderBoundary("PORTABLE_X64_SSE_PREFIX", rip);
	}
	const modrm = memory.u8(cursor + 2);
	const register = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const rm = (modrm & 7) + ((rex & 1) ? 8 : 0);
	const mod = modrm >> 6;
	if (opcode === 0x57) {
		return decodeXor(memory, rip, cursor, rex, mandatoryPrefix, modrm, register, rm, mod);
	}
	return decodeMove(memory, rip, cursor, rex, mandatoryPrefix, opcode, modrm, register, rm, mod);
}

function decodeXor(memory, rip, cursor, rex, prefix, modrm, destination, source, mod) {
	const encoding = prefix === 0x66 ? "xorpd" : "xorps";
	if (mod === 3) {
		return decodedInstruction("xor_xmm", rip, cursor + 3, {
			destination,
			encoding,
			source
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor + 3, modrm, rex);
	return decodedInstruction("xor_xmm_mem", rip, parsed.next, {
		address: parsed.address,
		destination,
		encoding
	});
}

function decodeMove(memory, rip, cursor, rex, prefix, opcode, modrm, register, rm, mod) {
	const load = opcode === 0x10 || opcode === 0x28;
	const aligned = opcode === 0x28 || opcode === 0x29;
	const encoding = moveEncoding(prefix, aligned);
	if (mod === 3) {
		return decodedInstruction("mov_xmm", rip, cursor + 3, {
			destination: load ? register : rm,
			encoding,
			source: load ? rm : register
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor + 3, modrm, rex);
	return decodedInstruction(load ? "mov_xmm_mem" : "mov_mem_xmm", rip, parsed.next, {
		address: parsed.address,
		destination: load ? register : null,
		encoding,
		source: load ? null : register
	});
}

function moveEncoding(prefix, aligned) {
	if (aligned) return prefix === 0x66 ? "movapd" : "movaps";
	return prefix === 0x66 ? "movupd" : "movups";
}
