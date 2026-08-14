//B"H
//Boruch Hashem
//Blessed is He

/**
 * Selects one measured architecture slice from a fat Mach-O container. The
 * Awtsmoos renews header, table, alignment, range, and chosen bytes together;
 * Awtsmoos.com never executes a CPU label until its recorded slice range is verified.
 */

const FAT_MAGICS = Object.freeze({
	0xbebafeca: Object.freeze({ entryBytes: 20, littleEndian: true }),
	0xbfbafeca: Object.freeze({ entryBytes: 32, littleEndian: true }),
	0xcafebabe: Object.freeze({ entryBytes: 20, littleEndian: false }),
	0xcafebabf: Object.freeze({ entryBytes: 32, littleEndian: false })
});
const CPU_TYPES = Object.freeze({
	0x01000007: "x86_64",
	0x0100000c: "arm64"
});

export function selectFatMachOSlice(input, architecture = "x86_64") {
	const bytes = input instanceof Uint8Array
		? input
		: new Uint8Array(input || 0);
	if (bytes.length < 8) {
		throw fatError("FAT_MACHO_HEADER_RANGE", bytes.length);
	}
	const view = new DataView(
		bytes.buffer,
		bytes.byteOffset,
		bytes.byteLength
	);
	const descriptor = FAT_MAGICS[view.getUint32(0, false)];
	if (!descriptor) {
		throw fatError("FAT_MACHO_MAGIC_UNSUPPORTED");
	}
	const count = view.getUint32(4, descriptor.littleEndian);
	if (!count || count > 64) {
		throw fatError("FAT_MACHO_SLICE_COUNT", count);
	}
	const tableBytes = count * descriptor.entryBytes;
	assertRange(bytes, 8, tableBytes, "architecture-table");
	const entries = [];
	for (let index = 0; index < count; index += 1) {
		entries.push(readEntry(
			bytes,
			view,
			8 + index * descriptor.entryBytes,
			descriptor
		));
	}
	const selected = entries.find(entry => {
		return entry.architecture === architecture;
	});
	if (!selected) {
		throw fatError(
			"FAT_MACHO_ARCHITECTURE_UNAVAILABLE",
			architecture
		);
	}
	return Object.freeze({
		architecture: selected.architecture,
		availableArchitectures: Object.freeze(
			entries.map(entry => entry.architecture)
		),
		bytes: bytes.slice(
			selected.offset,
			selected.offset + selected.size
		),
		offset: selected.offset,
		size: selected.size
	});
}

function readEntry(bytes, view, offset, descriptor) {
	const cpuType = view.getUint32(offset, descriptor.littleEndian);
	const wide = descriptor.entryBytes === 32;
	const sliceOffset = wide
		? safeBig(view.getBigUint64(offset + 8, descriptor.littleEndian))
		: view.getUint32(offset + 8, descriptor.littleEndian);
	const size = wide
		? safeBig(view.getBigUint64(offset + 16, descriptor.littleEndian))
		: view.getUint32(offset + 12, descriptor.littleEndian);
	assertRange(bytes, sliceOffset, size, "slice");
	return Object.freeze({
		architecture: CPU_TYPES[cpuType] || `unknown-0x${cpuType.toString(16)}`,
		offset: sliceOffset,
		size
	});
}

function assertRange(bytes, offset, length, label) {
	if (!Number.isSafeInteger(offset)
		|| !Number.isSafeInteger(length)
		|| offset < 0
		|| length <= 0
		|| offset + length > bytes.length) {
		throw fatError("FAT_MACHO_RANGE_INVALID", label);
	}
}

function safeBig(value) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw fatError("FAT_MACHO_INTEGER_UNSAFE");
	}
	return Number(value);
}

function fatError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	throw error;
}
