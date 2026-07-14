//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { readRegisterWidth, signed32ForMemory, writeRegisterWidth } from "./x64Width.js";

const MEMORY_KINDS = new Set([
	"lea_mem",
	"mov_mem_imm",
	"mov_mem_reg",
	"mov_reg_mem"
]);

/**
 * Executes bounded 16-bit, 32-bit, and 64-bit guest memory operations. The
 * Awtsmoos creates effective address, width, stored value, and load anew;
 * Awtsmoos.com lets permissioned memory decide whether each write may enter.
 */
export function executeMemoryOperation(item, registers, memory) {
	if (!MEMORY_KINDS.has(item.kind)) return false;
	const address = effectiveAddress(item, registers);
	if (item.kind === "lea_mem") {
		writeRegisterWidth(registers, item.destination, address, item.width);
		return true;
	}
	if (item.kind === "mov_reg_mem") {
		writeRegisterWidth(
			registers,
			item.destination,
			readMemoryWidth(memory, address, item.width),
			item.width
		);
		return true;
	}
	if (item.kind === "mov_mem_reg") {
		const value = readRegisterWidth(registers, item.source, item.width);
		writeMemoryWidth(memory, address, value, item.width);
		return true;
	}
	writeMemoryWidth(memory, address, item.value, item.width);
	return true;
}

function readMemoryWidth(memory, address, width) {
	if (width === 16) {
		return memory.u8(address) | memory.u8(address + 1) << 8;
	}
	return width === 32 ? memory.u32(address) : memory.i64(address);
}

function writeMemoryWidth(memory, address, value, width) {
	if (width === 16) {
		memory.write8(address, value);
		memory.write8(address + 1, Number(value) >>> 8);
		return;
	}
	if (width === 32) {
		memory.write32(address, signed32ForMemory(value));
		return;
	}
	memory.write64(address, value);
}
