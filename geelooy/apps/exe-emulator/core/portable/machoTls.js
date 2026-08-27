//B"H
//Boruch Hashem
//Blessed is He

import { readMachOCommands } from "./machoCommands.js";
import { readMachOSections } from "./machoSections.js";

const THREAD_DATA = 0x11;
const THREAD_BSS = 0x12;
const THREAD_VARS = 0x13;

/**
 * Builds the initial Mach-O thread-local template and descriptor inventory. The
 * Awtsmoos creates alignment, initialized bytes, zero-filled extent, and descriptor
 * offset anew; Awtsmoos.com derives TLS entirely from section metadata and bytes.
 */
export function inspectMachOTls(bytes, image, options = {}) {
	const sections = readMachOSections(readMachOCommands(bytes, options), options);
	const storageSections = sections.filter(section => {
		return [THREAD_DATA, THREAD_BSS].includes(section.type);
	});
	const descriptorSection = sections.find(section => section.type === THREAD_VARS);
	if (!descriptorSection || !storageSections.length) return emptyTls();
	const layout = buildStorageLayout(storageSections, image, options);
	const descriptors = readDescriptors(descriptorSection, image, options);
	return Object.freeze({
		descriptors: Object.freeze(descriptors),
		section: descriptorSection,
		storage: layout.bytes,
		storageSize: layout.bytes.length
	});
}

function buildStorageLayout(sections, image, options) {
	const maximumBytes = Number(options.maximumTlsBytes || 16 * 1024 * 1024);
	let cursor = 0;
	const placements = [];
	for (const section of sections.sort((left, right) => left.address - right.address)) {
		const alignment = 2 ** section.align;
		cursor = alignUp(cursor, alignment);
		placements.push({ offset: cursor, section });
		cursor += section.size;
		if (cursor > maximumBytes) throw tlsError("PORTABLE_TLS_LIMIT", cursor);
	}
	const output = new Uint8Array(cursor);
	for (const placement of placements) {
		if (placement.section.type !== THREAD_DATA) continue;
		const source = mappedSectionBytes(placement.section, image);
		output.set(source, placement.offset);
	}
	return Object.freeze({ bytes: output, placements: Object.freeze(placements) });
}

function readDescriptors(section, image, options) {
	if (section.size % 24 !== 0) {
		throw tlsError("PORTABLE_TLS_DESCRIPTOR_SIZE", section.size);
	}
	const maximum = Number(options.maximumTlsDescriptors || 65536);
	const count = section.size / 24;
	if (count > maximum) throw tlsError("PORTABLE_TLS_DESCRIPTOR_LIMIT", count);
	const bytes = mappedSectionBytes(section, image);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Array.from({ length: count }, (_, index) => Object.freeze({
		address: section.address + index * 24,
		key: safeBig(view.getBigUint64(index * 24 + 8, true)),
		offset: safeBig(view.getBigUint64(index * 24 + 16, true)),
		thunk: safeBig(view.getBigUint64(index * 24, true))
	}));
}

function mappedSectionBytes(section, image) {
	const segment = image.segments.find(candidate => {
		return section.address >= candidate.address
			&& section.address + section.size <= candidate.address + candidate.bytes.length;
	});
	if (!segment) throw tlsError("PORTABLE_TLS_SECTION_UNMAPPED", section.name);
	const offset = section.address - segment.address;
	return segment.bytes.subarray(offset, offset + section.size);
}

function emptyTls() {
	return Object.freeze({
		descriptors: Object.freeze([]),
		section: null,
		storage: new Uint8Array(),
		storageSize: 0
	});
}

function alignUp(value, alignment) {
	return Math.ceil(value / alignment) * alignment;
}

function safeBig(value) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw tlsError("PORTABLE_TLS_INTEGER_UNSAFE", value);
	}
	return Number(value);
}

function tlsError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
