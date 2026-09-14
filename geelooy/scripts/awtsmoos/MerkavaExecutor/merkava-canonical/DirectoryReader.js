//B"H
//Boruch Hashem
//Blessed be He

const { crc32 } = require('./Crc32.js');
const { DIRECTORY_ENTRY_BYTES, sectionName } = require('./Format.js');

/**
 * Reads the directory only after the fixed header has passed validation.
 * Every record is bounds-checked and CRC-checked before its payload is exposed.
 * @param {Uint8Array} bytes Complete canonical bytes.
 * @param {DataView} view Complete canonical view.
 * @param {object} header Validated header.
 * @returns {Array<object>} Verified section records.
 */
function readDirectory(bytes, view, header) {
	const sections = [];
	for (let index = 0; index < header.sectionCount; index += 1) {
		const at = header.directoryOffset + index * DIRECTORY_ENTRY_BYTES;
		const type = view.getUint16(at, true);
		const offset = view.getUint32(at + 4, true);
		const length = view.getUint32(at + 8, true);
		const checksum = view.getUint32(at + 12, true);
		const reserved = view.getUint32(at + 16, true);
		if (!type || reserved || offset < header.payloadOffset || offset + length > bytes.length) {
			throw new Error(`merkava_section_bounds:${type}`);
		}
		const payload = bytes.slice(offset, offset + length);
		if (crc32(payload) !== checksum) {
			throw new Error(`merkava_section_crc:${type}`);
		}
		sections.push({
			bytes: payload,
			checksum,
			flags: view.getUint16(at + 2, true),
			length,
			name: sectionName(type),
			offset,
			type
		});
	}
	return sections;
}

/**
 * Rejects duplicate types and overlapping payloads after individual validation.
 * @param {Array<object>} sections Verified section records.
 * @param {object} header Validated canonical header.
 * @returns {void}
 */
function validateSections(sections, header) {
	const ordered = [...sections].sort((left, right) => left.offset - right.offset);
	const types = new Set();
	let edge = header.payloadOffset;
	for (const section of ordered) {
		if (types.has(section.type)) {
			throw new Error(`merkava_duplicate_section:${section.type}`);
		}
		if (section.offset < edge) {
			throw new Error(`merkava_section_overlap:${section.type}`);
		}
		types.add(section.type);
		edge = section.offset + section.length;
	}
}

module.exports = {
	readDirectory,
	validateSections
};
