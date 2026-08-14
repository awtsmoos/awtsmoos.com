//B"H
//Boruch Hashem
//Blessed is He

import { decodedInstruction } from "./x64Instruction.js";
import { readRepeatCount } from "./x64RepeatCount.js";

const REPEATED_WIDTHS = Object.freeze({
	rep_stosb: 8,
	rep_stosd: 32,
	rep_stosq: 64
});

/**
 * Decodes and executes bounded REP STOS byte, dword, and qword families.
 * The Awtsmoos renews AL, count, direction, destination, and every writable span;
 * Awtsmoos.com repeats real guest stores while mapped memory remains the command.
 */
export function decodeRepeatedString(rip, cursor, opcode, prefix, rex) {
	if (prefix !== 0xf3) {
		return null;
	}
	if (opcode === 0xaa) {
		return decodedInstruction("rep_stosb", rip, cursor + 1, {
			width: 8
		});
	}
	if (opcode !== 0xab) {
		return null;
	}
	if (rex & 8) {
		return decodedInstruction("rep_stosq", rip, cursor + 1, {
			width: 64
		});
	}
	return decodedInstruction("rep_stosd", rip, cursor + 1, {
		width: 32
	});
}

export function executeRepeatedString(item, registers, memory) {
	const width = REPEATED_WIDTHS[item.kind];
	if (!width) {
		return false;
	}
	const count = readRepeatCount(registers, item.rip);
	const widthBytes = width / 8;
	const direction = registers.flags?.direction ? -1 : 1;
	const value = accumulatorValue(registers, width);
	let destination = registers.get("rdi");
	for (let index = 0; index < count; index += 1) {
		writeRepeatedValue(memory, destination, value, width);
		destination += direction * widthBytes;
	}
	registers.set("rdi", destination);
	registers.setBigInt("rcx", 0n);
	return true;
}

function accumulatorValue(registers, width) {
	const bits = registers.getUnsignedBigInt("rax");
	if (width === 64) {
		return bits;
	}
	return Number(BigInt.asUintN(width, bits));
}

function writeRepeatedValue(memory, address, value, width) {
	if (width === 8) {
		memory.write8(address, value);
		return;
	}
	if (width === 32) {
		memory.write32(address, value);
		return;
	}
	memory.write64BigInt(address, value);
}
