//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes measured AArch64 load/store families. The Awtsmoos recreates base,
 * effective address, transferred width, and stack update anew; Awtsmoos.com
 * keeps every guest-memory crossing bounded by the composite memory vessel.
 */
export function executeAarch64Memory(instruction, registers, memory) {
	if (instruction.family === "load-store-unsigned-immediate") {
		executeSingle(instruction, registers, memory);
		return true;
	}
	if (instruction.family === "load-store-register-pair") {
		executePair(instruction, registers, memory);
		return true;
	}
	return false;
}

function executeSingle(instruction, registers, memory) {
	const base = registers.read(instruction.base, 64, "sp");
	const address = base + BigInt(instruction.immediate);
	if (instruction.mnemonic === "str") {
		writeInteger(
			memory,
			address,
			registers.read(instruction.register, instruction.width, "zero"),
			instruction.width
		);
		return;
	}
	const value = readInteger(memory, address, instruction.width);
	const result = instruction.mnemonic === "ldrsw"
		? BigInt.asUintN(64, BigInt.asIntN(32, value))
		: value;
	registers.write(
		instruction.register,
		result,
		instruction.mnemonic === "ldrsw" ? 64 : instruction.width,
		"zero"
	);
}

function executePair(instruction, registers, memory) {
	const base = registers.read(instruction.base, 64, "sp");
	const displacement = BigInt(instruction.displacement);
	const address = instruction.mode === "pre-index"
		? base + displacement
		: base;
	if (instruction.mode === "pre-index") {
		registers.write(instruction.base, address, 64, "sp");
	}
	if (instruction.mnemonic === "stp") {
		writeInteger(
			memory,
			address,
			registers.read(instruction.firstRegister, instruction.width, "zero"),
			instruction.width
		);
		writeInteger(
			memory,
			address + BigInt(instruction.width / 8),
			registers.read(instruction.secondRegister, instruction.width, "zero"),
			instruction.width
		);
	} else {
		registers.write(
			instruction.firstRegister,
			readInteger(memory, address, instruction.width),
			instruction.width,
			"zero"
		);
		registers.write(
			instruction.secondRegister,
			readInteger(
				memory,
				address + BigInt(instruction.width / 8),
				instruction.width
			),
			instruction.width,
			"zero"
		);
	}
	if (instruction.mode === "post-index") {
		registers.write(
			instruction.base,
			base + displacement,
			64,
			"sp"
		);
	}
}

function readInteger(memory, address, width) {
	const size = width / 8;
	const bytes = memory.read(address, size);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (size === 1) return BigInt(view.getUint8(0));
	if (size === 2) return BigInt(view.getUint16(0, true));
	if (size === 4) return BigInt(view.getUint32(0, true));
	return view.getBigUint64(0, true);
}

function writeInteger(memory, address, value, width) {
	const size = width / 8;
	const bytes = new Uint8Array(size);
	const view = new DataView(bytes.buffer);
	const normalized = BigInt(value);
	if (size === 1) view.setUint8(0, Number(normalized & 0xffn));
	if (size === 2) view.setUint16(0, Number(normalized & 0xffffn), true);
	if (size === 4) view.setUint32(0, Number(normalized & 0xffffffffn), true);
	if (size === 8) view.setBigUint64(0, BigInt.asUintN(64, normalized), true);
	memory.write(address, bytes);
}
