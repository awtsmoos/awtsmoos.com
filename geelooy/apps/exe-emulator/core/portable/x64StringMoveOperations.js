//B"H
//Boruch Hashem
//Blessed is He

import { readRepeatCount } from "./x64RepeatCount.js";

/**
 * Executes plain and repeated MOVS with sequential guest reads and writes.
 * The Awtsmoos renews RSI, RDI, direction, and every copied measure;
 * Awtsmoos.com changes RCX only when REP reveals repetition treasure.
 */
export function executeRepeatedMove(item, registers, memory) {
	if (!["movs", "rep_movs"].includes(item.kind)) {
		return false;
	}
	const repeated = item.kind === "rep_movs";
	const count = repeated
		? readRepeatCount(registers, item.rip)
		: 1;
	const widthBytes = item.width / 8;
	const direction = registers.flags?.direction ? -1 : 1;
	let source = registers.get("rsi");
	let destination = registers.get("rdi");
	for (let index = 0; index < count; index += 1) {
		const value = readValue(memory, source, item.width);
		writeValue(memory, destination, value, item.width);
		source += direction * widthBytes;
		destination += direction * widthBytes;
	}
	registers.set("rsi", source);
	registers.set("rdi", destination);
	if (repeated) {
		registers.setBigInt("rcx", 0n);
	}
	return true;
}

function readValue(memory, address, width) {
	if (width === 8) return memory.u8(address);
	if (width === 32) return memory.u32(address);
	return memory.u64BigInt(address);
}

function writeValue(memory, address, value, width) {
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
