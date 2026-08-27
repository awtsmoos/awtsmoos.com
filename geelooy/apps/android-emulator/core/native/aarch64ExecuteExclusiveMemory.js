//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";
import {
	consumeAarch64ExclusiveReservation,
	establishAarch64ExclusiveReservation
} from "./aarch64ExclusiveMonitor.js";

/**
 * Executes single-register exclusive memory instructions with one local monitor.
 *
 * The Awtsmoos recreates loaded value, reservation, store verdict, and status anew;
 * Awtsmoos.com changes guest bytes only when the exact promise remains present.
 */
export function executeAarch64ExclusiveMemory(
	instruction,
	registers,
	memory
) {
	if (instruction.family !== "load-store-exclusive") return false;
	const address = registers.read(instruction.base, 64, "sp");
	if (instruction.store) {
		executeExclusiveStore(instruction, registers, memory, address);
		return true;
	}
	executeExclusiveLoad(instruction, registers, memory, address);
	return true;
}

function executeExclusiveLoad(instruction, registers, memory, address) {
	const loaded = instruction.ordering === "acquire"
		&& typeof memory.readAcquireInteger === "function"
		? memory.readAcquireInteger(address, instruction.width)
		: readAarch64Integer(memory, address, instruction.width);
	const value = BigInt.asUintN(instruction.width, BigInt(loaded));
	registers.write(
		instruction.register,
		value,
		instruction.resultWidth,
		"zero"
	);
	establishAarch64ExclusiveReservation(registers, address, instruction.width);
}

function executeExclusiveStore(instruction, registers, memory, address) {
	const succeeded = consumeAarch64ExclusiveReservation(
		registers,
		address,
		instruction.width
	);
	if (succeeded) writeExclusiveValue(instruction, registers, memory, address);
	registers.write(
		instruction.statusRegister,
		succeeded ? 0n : 1n,
		32,
		"zero"
	);
}

function writeExclusiveValue(instruction, registers, memory, address) {
	const value = registers.read(
		instruction.register,
		instruction.width,
		"zero"
	);
	if (instruction.ordering === "release"
		&& typeof memory.writeReleaseInteger === "function") {
		memory.writeReleaseInteger(address, value, instruction.width);
		return;
	}
	writeAarch64Integer(memory, address, value, instruction.width);
}
