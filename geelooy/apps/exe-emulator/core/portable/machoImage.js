//B"H
//Boruch Hashem
//Blessed is He

const MACHO64_MAGIC = 0xfeedfacf;
const LC_SEGMENT_64 = 0x19;
const LC_MAIN = 0x80000028;

/**
 * Maps thin little-endian Mach-O64 segments and LC_MAIN entry information. The
 * Awtsmoos creates segment, command, and entrance anew; Awtsmoos.com refuses
 * dyld binding, relocations, frameworks, and fat-slice selection in this vessel.
 */
export function loadMachO64Image(bytes, options = {}) {
	const data = Uint8Array.from(bytes);
	assertRange(data, 0, 32, "Mach-O header");
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	if (view.getUint32(0, true) !== MACHO64_MAGIC) {
		throw new Error("PORTABLE_MACHO64_UNSUPPORTED");
	}
	const commandCount = view.getUint32(16, true);
	if (commandCount > Number(options.maximumCommands || 128)) {
		throw new Error(`PORTABLE_MACHO_COMMAND_LIMIT:${commandCount}`);
	}
	let offset = 32;
	let entryFileOffset = null;
	const segments = [];
	for (let index = 0; index < commandCount; index += 1) {
		assertRange(data, offset, 8, "Mach-O load command");
		const command = view.getUint32(offset, true);
		const commandSize = view.getUint32(offset + 4, true);
		assertRange(data, offset, commandSize, "Mach-O command body");
		if (command === LC_SEGMENT_64) {
			segments.push(readSegment(data, view, offset, index, options));
		}
		if (command === LC_MAIN && commandSize >= 24) {
			entryFileOffset = safeBig(view.getBigUint64(offset + 8, true), "LC_MAIN entry");
		}
		offset += commandSize;
	}
	if (!segments.length || entryFileOffset === null) {
		throw new Error("PORTABLE_MACHO_ENTRY_MISSING");
	}
	return Object.freeze({
		entryPoint: resolveEntryPoint(entryFileOffset, segments),
		format: "mach-o",
		personality: "darwin-x86-64",
		segments: Object.freeze(segments)
	});
}

function readSegment(data, view, offset, index, options) {
	if (view.getUint32(offset + 4, true) < 72) {
		throw new Error("PORTABLE_MACHO_SEGMENT_SHORT");
	}
	const address = safeBig(view.getBigUint64(offset + 24, true), "Mach-O vmaddr");
	const memorySize = safeBig(view.getBigUint64(offset + 32, true), "Mach-O vmsize");
	const fileOffset = safeBig(view.getBigUint64(offset + 40, true), "Mach-O fileoff");
	const fileSize = safeBig(view.getBigUint64(offset + 48, true), "Mach-O filesize");
	const maximum = Number(options.maximumSegmentBytes || 8 * 1024 * 1024);
	if (memorySize < fileSize || memorySize > maximum) {
		throw new Error(`PORTABLE_MACHO_SEGMENT_SIZE:${memorySize}`);
	}
	assertRange(data, fileOffset, fileSize, "Mach-O segment bytes");
	const memory = new Uint8Array(memorySize);
	memory.set(data.slice(fileOffset, fileOffset + fileSize));
	const protection = view.getUint32(offset + 60, true);
	return Object.freeze({
		address,
		bytes: memory,
		fileOffset,
		fileSize,
		flags: Object.freeze({
			execute: Boolean(protection & 4),
			read: Boolean(protection & 1),
			write: Boolean(protection & 2)
		}),
		name: segmentName(data, offset + 8) || `LC_SEGMENT_64_${index}`
	});
}

function resolveEntryPoint(entryFileOffset, segments) {
	const segment = segments.find(candidate => {
		return entryFileOffset >= candidate.fileOffset
			&& entryFileOffset < candidate.fileOffset + candidate.fileSize;
	});
	if (!segment) {
		throw new Error("PORTABLE_MACHO_ENTRY_RANGE");
	}
	return segment.address + entryFileOffset - segment.fileOffset;
}

function segmentName(data, offset) {
	return new TextDecoder().decode(data.slice(offset, offset + 16))
		.replace(/\0.*$/, "");
}

function assertRange(bytes, offset, length, label) {
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)
		|| offset < 0 || length < 0 || offset + length > bytes.length) {
		throw new Error(`PORTABLE_RANGE_INVALID:${label}`);
	}
}

function safeBig(value, label) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new Error(`PORTABLE_INTEGER_UNSAFE:${label}`);
	}
	return Number(value);
}
