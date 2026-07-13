//B"H
//Boruch Hashem
//Blessed is He

import { byteReader } from "./byteReader.js";
import { nativeBuildError } from "./errors.js";

/**
 * ELF identity includes class, endianness, ABI, machine, and entry point. The
 * Awtsmoos creates every ABI boundary; Awtsmoos.com names the exact Linux vessel
 * and never expands one ELF into an imaginary promise of universal Unix.
 */

const MACHINES = Object.freeze({
	3: "x86",
	62: "x86_64",
	183: "arm64"
});

const TYPES = Object.freeze({
	2: "executable",
	3: "shared-object"
});

export function identifyElf(input) {
	const reader = byteReader(input);
	if (reader.length < 4 || reader.u8(0) !== 0x7f || reader.ascii(1, 3) !== "ELF") {
		return null;
	}
	reader.requireRange(0, 52, "ELF header");
	const classCode = reader.u8(4);
	const dataCode = reader.u8(5);
	if (![1, 2].includes(classCode) || ![1, 2].includes(dataCode)) {
		throw nativeBuildError("INVALID_ELF_ENCODING", "ELF class or endianness is invalid.", {
			stage: "artifact-validation"
		});
	}
	const bits = classCode === 2 ? 64 : 32;
	const littleEndian = dataCode === 1;
	if (bits === 64) {
		reader.requireRange(0, 64, "ELF64 header");
	}
	const machineCode = reader.u16(18, littleEndian);
	const entryPoint = bits === 64
		? reader.u64(24, littleEndian).toString()
		: String(reader.u32(24, littleEndian));
	return Object.freeze({
		format: "elf",
		architecture: MACHINES[machineCode] || `unknown-${machineCode}`,
		machineCode,
		bits,
		endianness: littleEndian ? "little" : "big",
		abi: elfAbi(reader.u8(7)),
		kind: TYPES[reader.u16(16, littleEndian)] || "other",
		entryPoint,
		valid: Boolean(MACHINES[machineCode]),
		executionMode: "elf-loader-inspection"
	});
}

function elfAbi(code) {
	if (code === 0) {
		return "system-v";
	}
	if (code === 3) {
		return "linux";
	}
	if (code === 9) {
		return "freebsd";
	}
	return `unknown-${code}`;
}
