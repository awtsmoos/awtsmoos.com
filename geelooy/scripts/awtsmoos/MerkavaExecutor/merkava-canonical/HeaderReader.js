//B"H
//Boruch Hashem
//Blessed be He

const {
	CANONICAL_MAGIC,
	DIRECTORY_ENTRY_BYTES,
	HEADER_BYTES,
	MAX_SECTIONS
} = require('./Format.js');

/**
 * Confirms the four-byte canonical magic before any numeric header is trusted.
 * @param {Uint8Array} bytes Complete container bytes.
 * @returns {void}
 */
function assertMagic(bytes) {
	for (let index = 0; index < CANONICAL_MAGIC.length; index += 1) {
		if (bytes[index] !== CANONICAL_MAGIC[index]) {
			throw new Error('merkava_magic_invalid');
		}
	}
}

/**
 * Reads the fixed little-endian canonical header into a named immutable shape.
 * @param {DataView} view Container view.
 * @returns {object} Parsed header values.
 */
function readHeader(view) {
	return {
		containerVersion: view.getUint8(4),
		isaVersion: view.getUint8(5),
		hostAbiVersion: view.getUint8(6),
		flags: view.getUint8(7),
		sectionCount: view.getUint16(8, true),
		headerBytes: view.getUint16(10, true),
		totalBytes: view.getUint32(12, true),
		directoryOffset: view.getUint32(16, true),
		directoryBytes: view.getUint32(20, true),
		payloadOffset: view.getUint32(24, true),
		reserved: view.getUint32(28, true)
	};
}

/**
 * Enforces the exact v1 structural header contract and all size relationships.
 * @param {object} header Parsed header.
 * @param {number} actualBytes Actual container byte length.
 * @returns {void}
 */
function validateHeader(header, actualBytes) {
	if (header.headerBytes !== HEADER_BYTES || header.reserved !== 0) {
		throw new Error('merkava_header_contract_invalid');
	}
	if (header.totalBytes !== actualBytes || header.sectionCount > MAX_SECTIONS) {
		throw new Error('merkava_length_contract_invalid');
	}
	const expectedDirectory = header.sectionCount * DIRECTORY_ENTRY_BYTES;
	if (header.directoryOffset !== HEADER_BYTES || header.directoryBytes !== expectedDirectory) {
		throw new Error('merkava_directory_contract_invalid');
	}
	if (header.payloadOffset < HEADER_BYTES + expectedDirectory || header.payloadOffset > actualBytes) {
		throw new Error('merkava_payload_offset_invalid');
	}
}

module.exports = {
	assertMagic,
	readHeader,
	validateHeader
};
