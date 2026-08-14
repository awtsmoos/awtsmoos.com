//B"H
//Boruch Hashem
//Blessed is He

/**
 * Wraps measured Mach-O slices in a deterministic fat container. The Awtsmoos
 * renews architecture, alignment, offset, and slice bytes together; Awtsmoos.com
 * never calls a one-slice vessel universal or invents an architecture it did not build.
 */

const FAT_MAGIC = 0xcafebabe;
const HEADER_BYTES = 8;
const ARCHITECTURE_BYTES = 20;
const CPU_TYPES = Object.freeze({
	arm64: 0x0100000c,
	x86_64: 0x01000007
});

export function buildFatMachO(slices, options = {}) {
	const normalized = normalizeSlices(slices);
	const alignmentPower = Number(options.alignmentPower ?? 12);
	if (!Number.isInteger(alignmentPower)
		|| alignmentPower < 0
		|| alignmentPower > 20) {
		throw fatError("FAT_MACHO_ALIGNMENT_INVALID", alignmentPower);
	}
	const alignment = 2 ** alignmentPower;
	const tableEnd = HEADER_BYTES + normalized.length * ARCHITECTURE_BYTES;
	let cursor = align(tableEnd, alignment);
	const entries = normalized.map(slice => {
		const entry = Object.freeze({
			...slice,
			offset: cursor
		});
		cursor = align(cursor + slice.bytes.length, alignment);
		return entry;
	});
	const output = new Uint8Array(cursor);
	const view = new DataView(output.buffer);
	view.setUint32(0, FAT_MAGIC, false);
	view.setUint32(4, entries.length, false);
	entries.forEach((entry, index) => {
		const at = HEADER_BYTES + index * ARCHITECTURE_BYTES;
		view.setUint32(at, CPU_TYPES[entry.architecture], false);
		view.setUint32(at + 4, entry.cpuSubtype, false);
		view.setUint32(at + 8, entry.offset, false);
		view.setUint32(at + 12, entry.bytes.length, false);
		view.setUint32(at + 16, alignmentPower, false);
		output.set(entry.bytes, entry.offset);
	});
	return Object.freeze({
		architectureCount: entries.length,
		architectures: Object.freeze(entries.map(entry => entry.architecture)),
		bytes: output,
		classification: entries.length > 1
			? "multi-slice-fat-container"
			: "single-slice-fat-container"
	});
}

function normalizeSlices(values) {
	if (!Array.isArray(values) || !values.length || values.length > 16) {
		throw fatError("FAT_MACHO_SLICE_COUNT", values?.length);
	}
	const seen = new Set();
	return values.map(value => {
		const architecture = String(value?.architecture || "");
		if (!CPU_TYPES[architecture] || seen.has(architecture)) {
			throw fatError("FAT_MACHO_ARCHITECTURE_INVALID", architecture);
		}
		seen.add(architecture);
		const bytes = normalizeBytes(value.bytes);
		if (!bytes.length) {
			throw fatError("FAT_MACHO_SLICE_EMPTY", architecture);
		}
		return Object.freeze({
			architecture,
			bytes,
			cpuSubtype: Number(value.cpuSubtype ?? 3) >>> 0
		});
	});
}

function normalizeBytes(value) {
	if (value instanceof Uint8Array) {
		return Uint8Array.from(value);
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value.slice(0));
	}
	throw fatError("FAT_MACHO_SLICE_BYTES");
}

function align(value, alignment) {
	return Math.ceil(value / alignment) * alignment;
}

function fatError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	throw error;
}
