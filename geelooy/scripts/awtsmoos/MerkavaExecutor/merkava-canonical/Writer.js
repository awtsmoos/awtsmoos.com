//B"H
//Boruch Hashem
//Blessed be He

const { alignFour, asBytes } = require('./Bytes.js');
const { crc32 } = require('./Crc32.js');
const {
	CANONICAL_MAGIC,
	CONTAINER_VERSION,
	DIRECTORY_ENTRY_BYTES,
	HEADER_BYTES,
	HOST_ABI_VERSION,
	ISA_VERSION,
	MAX_SECTIONS
} = require('./Format.js');

/**
 * Serializes one deterministic canonical Merkava container.
 *
 * Sections are sorted by numeric type, duplicate canonical types are rejected,
 * payloads are four-byte aligned, and every section carries a CRC32 witness.
 * @param {{sections:Array<{type:number,flags?:number,bytes:Uint8Array}>,flags?:number}} input Container input.
 * @returns {Uint8Array} Canonical `.merkava` bytes.
 */
function writeCanonicalContainer(input = {}) {
	const sections = normalizeSections(input.sections || []);
	const directoryBytes = sections.length * DIRECTORY_ENTRY_BYTES;
	const payloadOffset = alignFour(HEADER_BYTES + directoryBytes);
	let totalBytes = payloadOffset;
	for (const section of sections) {
		section.offset = totalBytes;
		totalBytes = alignFour(totalBytes + section.bytes.length);
	}
	const output = new Uint8Array(totalBytes);
	const view = new DataView(output.buffer);
	writeHeader(output, view, sections.length, directoryBytes, payloadOffset, totalBytes, input.flags || 0);
	writeDirectory(output, view, sections);
	for (const section of sections) {
		output.set(section.bytes, section.offset);
	}
	return output;
}

/** @returns {Array<{type:number,flags:number,bytes:Uint8Array,offset:number}>} */
function normalizeSections(input) {
	if (input.length > MAX_SECTIONS) {
		throw new Error('merkava_section_limit');
	}
	const sections = input.map(section => ({
		bytes: asBytes(section.bytes || []),
		flags: Number(section.flags || 0) & 0xffff,
		offset: 0,
		type: Number(section.type)
	})).sort((left, right) => left.type - right.type);
	for (let index = 0; index < sections.length; index += 1) {
		const section = sections[index];
		if (!Number.isInteger(section.type) || section.type < 1 || section.type > 0xffff) {
			throw new Error(`merkava_section_type:${section.type}`);
		}
		if (index && sections[index - 1].type === section.type) {
			throw new Error(`merkava_duplicate_section:${section.type}`);
		}
	}
	return sections;
}

/** @returns {void} */
function writeHeader(output, view, count, directoryBytes, payloadOffset, totalBytes, flags) {
	output.set(CANONICAL_MAGIC, 0);
	view.setUint8(4, CONTAINER_VERSION);
	view.setUint8(5, ISA_VERSION);
	view.setUint8(6, HOST_ABI_VERSION);
	view.setUint8(7, Number(flags) & 0xff);
	view.setUint16(8, count, true);
	view.setUint16(10, HEADER_BYTES, true);
	view.setUint32(12, totalBytes, true);
	view.setUint32(16, HEADER_BYTES, true);
	view.setUint32(20, directoryBytes, true);
	view.setUint32(24, payloadOffset, true);
	view.setUint32(28, 0, true);
}

/** @returns {void} */
function writeDirectory(output, view, sections) {
	sections.forEach((section, index) => {
		const at = HEADER_BYTES + index * DIRECTORY_ENTRY_BYTES;
		view.setUint16(at, section.type, true);
		view.setUint16(at + 2, section.flags, true);
		view.setUint32(at + 4, section.offset, true);
		view.setUint32(at + 8, section.bytes.length, true);
		view.setUint32(at + 12, crc32(section.bytes), true);
		view.setUint32(at + 16, 0, true);
	});
}

module.exports = {
	writeCanonicalContainer
};
