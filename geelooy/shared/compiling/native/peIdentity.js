//B"H
//Boruch Hashem
//Blessed is He

import { byteReader } from "./byteReader.js";
import { nativeBuildError } from "./errors.js";

/**
 * A PE image must reveal itself through DOS, NT, COFF, and optional headers.
 * The Awtsmoos recreates every field; Awtsmoos.com reads machine and subsystem
 * from bytes rather than trusting an `.exe` garment or a browser declaration.
 */

const MACHINES = Object.freeze({
	0x014c: "x86",
	0x8664: "x86_64",
	0xaa64: "arm64"
});

const SUBSYSTEMS = Object.freeze({
	2: "gui",
	3: "console"
});

export function identifyPe(input) {
	const reader = byteReader(input);
	if (reader.length < 64 || reader.u16(0) !== 0x5a4d) {
		return null;
	}
	const peOffset = reader.u32(0x3c);
	reader.requireRange(peOffset, 24, "PE header");
	if (reader.u32(peOffset) !== 0x00004550) {
		throw nativeBuildError("INVALID_PE_SIGNATURE", "DOS header does not point to a PE signature.", {
			stage: "artifact-validation"
		});
	}
	const machineCode = reader.u16(peOffset + 4);
	const sectionCount = reader.u16(peOffset + 6);
	const optionalSize = reader.u16(peOffset + 20);
	const characteristics = reader.u16(peOffset + 22);
	const optionalOffset = peOffset + 24;
	reader.requireRange(optionalOffset, optionalSize, "PE optional header");
	const optionalMagic = reader.u16(optionalOffset);
	if (![0x010b, 0x020b].includes(optionalMagic)) {
		throw nativeBuildError("UNSUPPORTED_PE_OPTIONAL_HEADER", `Unsupported PE optional-header magic 0x${optionalMagic.toString(16)}.`, {
			stage: "artifact-validation"
		});
	}
	const architecture = MACHINES[machineCode] || `unknown-0x${machineCode.toString(16)}`;
	const subsystemCode = reader.u16(optionalOffset + 68);
	return Object.freeze({
		format: "pe",
		architecture,
		machineCode,
		bits: optionalMagic === 0x020b ? 64 : 32,
		kind: characteristics & 0x2000 ? "shared-library" : "executable",
		subsystem: SUBSYSTEMS[subsystemCode] || `unknown-${subsystemCode}`,
		sectionCount,
		entryPoint: reader.u32(optionalOffset + 16),
		valid: Boolean(MACHINES[machineCode]),
		executionMode: "windows-emulator"
	});
}
