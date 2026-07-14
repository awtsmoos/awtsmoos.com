//B"H
//Boruch Hashem
//Blessed is He

import { readMachOSegment } from "./machoSegment.js";

const MACHO64_MAGIC = 0xfeedfacf;
const LC_SEGMENT_64 = 0x19;
const LC_MAIN = 0x80000028;

/**
 * Maps thin little-endian Mach-O64 segments and LC_MAIN entry information. The
 * Awtsmoos creates command, loadable memory, ignored guard, and entrance anew;
 * Awtsmoos.com still refuses dyld binding, relocations, and framework execution.
 */
export function loadMachO64Image(bytes, options = {}) {
	const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	assertRange(data, 0, 32, "Mach-O header");
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	if (view.getUint32(0, true) !== MACHO64_MAGIC) {
		throw portableError("PORTABLE_MACHO64_UNSUPPORTED");
	}
	const commandCount = view.getUint32(16, true);
	if (commandCount > Number(options.maximumCommands || 128)) {
		throw portableError(`PORTABLE_MACHO_COMMAND_LIMIT:${commandCount}`);
	}
	const state = readLoadCommands(data, view, commandCount, options);
	if (!state.segments.length || state.entryFileOffset === null) {
		throw portableError("PORTABLE_MACHO_ENTRY_MISSING");
	}
	return Object.freeze({
		entryPoint: resolveEntryPoint(state.entryFileOffset, state.segments),
		format: "mach-o",
		ignoredSegments: Object.freeze(state.ignoredSegments),
		personality: "darwin-x86-64",
		segments: Object.freeze(state.segments)
	});
}

function readLoadCommands(data, view, commandCount, options) {
	const state = {
		entryFileOffset: null,
		ignoredSegments: [],
		segments: []
	};
	let offset = 32;
	for (let index = 0; index < commandCount; index += 1) {
		assertRange(data, offset, 8, "Mach-O load command");
		const command = view.getUint32(offset, true);
		const commandSize = view.getUint32(offset + 4, true);
		assertRange(data, offset, commandSize, "Mach-O command body");
		if (command === LC_SEGMENT_64) {
			const result = readMachOSegment(data, view, offset, index, options);
			if (result.segment) state.segments.push(result.segment);
			if (result.ignored) state.ignoredSegments.push(result.ignored);
		}
		if (command === LC_MAIN && commandSize >= 24) {
			state.entryFileOffset = safeBig(
				view.getBigUint64(offset + 8, true),
				"LC_MAIN entry"
			);
		}
		offset += commandSize;
	}
	return state;
}

function resolveEntryPoint(entryFileOffset, segments) {
	const segment = segments.find(candidate => {
		return entryFileOffset >= candidate.fileOffset
			&& entryFileOffset < candidate.fileOffset + candidate.fileSize;
	});
	if (!segment) throw portableError("PORTABLE_MACHO_ENTRY_RANGE");
	return segment.address + entryFileOffset - segment.fileOffset;
}

function assertRange(bytes, offset, length, label) {
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)
		|| offset < 0 || length < 0 || offset + length > bytes.length) {
		throw portableError(`PORTABLE_RANGE_INVALID:${label}`);
	}
}

function safeBig(value, label) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw portableError(`PORTABLE_INTEGER_UNSAFE:${label}`);
	}
	return Number(value);
}

function portableError(message) {
	const error = new Error(message);
	error.code = String(message).split(":")[0];
	return error;
}
