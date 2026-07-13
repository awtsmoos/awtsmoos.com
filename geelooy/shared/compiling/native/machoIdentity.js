//B"H
//Boruch Hashem
//Blessed is He

import { byteReader } from "./byteReader.js";
import { nativeBuildError } from "./errors.js";

/**
 * Thin and universal Mach-O vessels reveal architecture through magic and CPU
 * type. The Awtsmoos creates every slice; Awtsmoos.com reports each one instead
 * of calling a single architecture universal because a filename says so.
 */

const CPU_TYPES = Object.freeze({
	0x01000007: "x86_64",
	0x0100000c: "arm64"
});

const THIN_MAGICS = Object.freeze({
	0xfeedface: { bits: 32, littleEndian: false },
	0xcefaedfe: { bits: 32, littleEndian: true },
	0xfeedfacf: { bits: 64, littleEndian: false },
	0xcffaedfe: { bits: 64, littleEndian: true }
});

const FAT_MAGICS = Object.freeze({
	0xcafebabe: { bits: 32, littleEndian: false },
	0xbebafeca: { bits: 32, littleEndian: true },
	0xcafebabf: { bits: 64, littleEndian: false },
	0xbfbafeca: { bits: 64, littleEndian: true }
});

export function identifyMachO(input) {
	const reader = byteReader(input);
	if (reader.length < 4) {
		return null;
	}
	const magic = reader.u32(0, false);
	if (THIN_MAGICS[magic]) {
		return identifyThin(reader, THIN_MAGICS[magic]);
	}
	if (FAT_MAGICS[magic]) {
		return identifyFat(reader, FAT_MAGICS[magic]);
	}
	return null;
}

function identifyThin(reader, descriptor) {
	reader.requireRange(0, descriptor.bits === 64 ? 32 : 28, "Mach-O header");
	const cpuType = reader.u32(4, descriptor.littleEndian);
	return Object.freeze({
		format: "mach-o",
		architecture: CPU_TYPES[cpuType] || `unknown-0x${cpuType.toString(16)}`,
		cpuType,
		bits: descriptor.bits,
		endianness: descriptor.littleEndian ? "little" : "big",
		kind: "executable-or-library",
		commandCount: reader.u32(16, descriptor.littleEndian),
		valid: Boolean(CPU_TYPES[cpuType]),
		executionMode: "macho-loader-inspection"
	});
}

function identifyFat(reader, descriptor) {
	const count = reader.u32(4, descriptor.littleEndian);
	if (count === 0 || count > 64) {
		throw nativeBuildError("INVALID_MACHO_SLICE_COUNT", `Invalid Mach-O slice count: ${count}.`, {
			stage: "artifact-validation"
		});
	}
	const entrySize = descriptor.bits === 64 ? 32 : 20;
	reader.requireRange(8, count * entrySize, "fat Mach-O architecture table");
	const slices = Array.from({ length: count }, (_, index) => {
		const at = 8 + index * entrySize;
		const cpuType = reader.u32(at, descriptor.littleEndian);
		return Object.freeze({
			architecture: CPU_TYPES[cpuType] || `unknown-0x${cpuType.toString(16)}`,
			cpuType
		});
	});
	return Object.freeze({
		format: "mach-o-fat",
		architecture: slices.length > 1 ? "universal" : slices[0].architecture,
		bits: descriptor.bits,
		slices: Object.freeze(slices),
		valid: slices.every(slice => !slice.architecture.startsWith("unknown-")),
		executionMode: "macho-loader-inspection"
	});
}
