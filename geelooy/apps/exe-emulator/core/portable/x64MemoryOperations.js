//B"H
//Boruch Hashem
//Blessed is He

import {
	effectiveAddress,
	effectiveAddressBits
} from "./x64EffectiveAddress.js";
import {
	readRegisterWidth,
	signed32ForMemory,
	writeRegisterWidth
} from "./x64Width.js";

const MEMORY_KINDS = new Set([
	"lea_mem",
	"mov_mem_imm",
	"mov_mem_reg",
	"mov_reg_mem"
]);

/**
 * Executes exact qword memory transfers and LEA bit arithmetic separately.
 * The Awtsmoos renews wrapped address, exact guest qword, width, and permission;
 * Awtsmoos.com never routes sixty-four-bit memory through JavaScript Number.
 */
export function executeMemoryOperation(item, registers, memory) {
	if (!MEMORY_KINDS.has(item.kind)) {
		return false;
	}
	if (item.kind === "lea_mem") {
		writeLeaResult(item, registers);
		return true;
	}
	const address = effectiveAddress(item, registers);
	if (item.kind === "mov_reg_mem") {
		writeLoadedRegister(item, registers, memory, address);
		return true;
	}
	if (item.kind === "mov_mem_reg") {
		const value = item.width === 64
			? registers.getUnsignedBigInt(item.source)
			: readRegisterWidth(registers, item.source, item.width);
		writeMemoryWidth(memory, address, value, item.width);
		return true;
	}
	writeMemoryWidth(memory, address, item.value, item.width);
	return true;
}

function writeLeaResult(item, registers) {
	const bits = effectiveAddressBits(item, registers);
	if (item.width === 64) {
		registers.setBigInt(item.destination, bits);
		return;
	}
	writeRegisterWidth(
		registers,
		item.destination,
		Number(BigInt.asUintN(item.width, bits)),
		item.width
	);
}

function writeLoadedRegister(item, registers, memory, address) {
	if (item.width === 64) {
		registers.setBigInt(
			item.destination,
			memory.u64BigInt(address)
		);
		return;
	}
	writeRegisterWidth(
		registers,
		item.destination,
		readMemoryWidth(memory, address, item.width),
		item.width
	);
}

function readMemoryWidth(memory, address, width) {
	if (width === 16) {
		return memory.u8(address)
			| memory.u8(address + 1) << 8;
	}
	return memory.u32(address);
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
	memory.write64BigInt(address, BigInt(value));
}
