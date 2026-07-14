//B"H
//Boruch Hashem
//Blessed is He

const ELF_HEADER_SIZE = 64;
const PROGRAM_HEADER_SIZE = 56;
const PT_LOAD = 1;

/**
 * Maps ELF64 little-endian PT_LOAD segments into portable virtual memory. The
 * Awtsmoos creates file offset, virtual address, and entry anew; Awtsmoos.com
 * validates each range without performing relocations or dynamic linking.
 */
export function loadElf64Image(bytes, options = {}) {
	const data = Uint8Array.from(bytes);
	assertElfHeader(data);
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	const entryPoint = safeBig(view.getBigUint64(24, true), "ELF entry point");
	const tableOffset = safeBig(view.getBigUint64(32, true), "ELF program table");
	const entrySize = view.getUint16(54, true);
	const entryCount = view.getUint16(56, true);
	if (entrySize < PROGRAM_HEADER_SIZE || entryCount > Number(options.maximumSegments || 64)) {
		throw new Error(`PORTABLE_ELF_TABLE_INVALID:${entrySize}:${entryCount}`);
	}
	const segments = [];
	for (let index = 0; index < entryCount; index += 1) {
		const offset = tableOffset + index * entrySize;
		assertRange(data, offset, PROGRAM_HEADER_SIZE, "ELF program header");
		if (view.getUint32(offset, true) !== PT_LOAD) {
			continue;
		}
		segments.push(readLoadSegment(data, view, offset, index, options));
	}
	if (!segments.length) {
		throw new Error("PORTABLE_ELF_NO_LOAD_SEGMENTS");
	}
	return Object.freeze({
		entryPoint,
		format: "elf",
		personality: "linux-x86-64",
		segments: Object.freeze(segments)
	});
}

function readLoadSegment(data, view, offset, index, options) {
	const flags = view.getUint32(offset + 4, true);
	const fileOffset = safeBig(view.getBigUint64(offset + 8, true), "ELF file offset");
	const address = safeBig(view.getBigUint64(offset + 16, true), "ELF virtual address");
	const fileSize = safeBig(view.getBigUint64(offset + 32, true), "ELF file size");
	const memorySize = safeBig(view.getBigUint64(offset + 40, true), "ELF memory size");
	const maximum = Number(options.maximumSegmentBytes || 8 * 1024 * 1024);
	if (memorySize < fileSize || memorySize > maximum) {
		throw new Error(`PORTABLE_ELF_SEGMENT_SIZE:${memorySize}`);
	}
	assertRange(data, fileOffset, fileSize, "ELF segment");
	const memory = new Uint8Array(memorySize);
	memory.set(data.slice(fileOffset, fileOffset + fileSize));
	return Object.freeze({
		address,
		bytes: memory,
		flags: Object.freeze({
			execute: Boolean(flags & 1),
			read: Boolean(flags & 4),
			write: Boolean(flags & 2)
		}),
		name: `PT_LOAD_${index}`
	});
}

function assertElfHeader(data) {
	assertRange(data, 0, ELF_HEADER_SIZE, "ELF header");
	const magic = [0x7f, 0x45, 0x4c, 0x46];
	if (!magic.every((value, index) => data[index] === value) || data[4] !== 2 || data[5] !== 1) {
		throw new Error("PORTABLE_ELF64_UNSUPPORTED");
	}
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
