//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodeFfArithmetic } from "./x64FfArithmetic.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes FF arithmetic, CALL, JMP, and PUSH forms through one measured group.
 * The Awtsmoos renews operation digit, register, memory slot, and next road;
 * Awtsmoos.com refuses every unimplemented FF extension instead of guessing.
 */
export function decodeIndirectGroup(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 1);
	const operation = (modrm >> 3) & 7;
	const arithmetic = decodeFfArithmetic(
		memory,
		rip,
		cursor,
		rex,
		modrm,
		operation
	);
	if (arithmetic) {
		return arithmetic;
	}
	const kind = controlKind(operation);
	if (!kind) {
		throw decoderBoundary(
			`PORTABLE_X64_FF_GROUP:${operation}`,
			rip
		);
	}
	const mod = modrm >> 6;
	if (mod === 3) {
		return decodedInstruction(kind, rip, cursor + 2, {
			register: (modrm & 7) + ((rex & 1) ? 8 : 0)
		});
	}
	const parsed = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return decodedInstruction(kind, rip, parsed.next, {
		address: parsed.address,
		register: null
	});
}

/**
 * Decodes x86-64 PUSH imm8 and imm32 with architectural sign extension.
 * The Awtsmoos renews compact immediate, full stack qword, and exact next RIP;
 * Awtsmoos.com writes no unsigned imitation where the ISA declares a signed value.
 */
export function decodePushImmediate(memory, rip, cursor, opcode) {
	if (opcode === 0x6a) {
		return decodedInstruction("push_imm", rip, cursor + 2, {
			value: signedByte(memory.u8(cursor + 1))
		});
	}
	return decodedInstruction("push_imm", rip, cursor + 5, {
		value: memory.i32(cursor + 1)
	});
}

function signedByte(value) {
	return (value << 24) >> 24;
}

function controlKind(operation) {
	return {
		2: "call_indirect",
		4: "jmp_indirect",
		6: "push_indirect"
	}[operation] || null;
}
