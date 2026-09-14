//B"H
//Boruch Hashem
//Blessed be He

const { asBytes } = require('./Bytes.js');
const { readDirectory, validateSections } = require('./DirectoryReader.js');
const { HEADER_BYTES } = require('./Format.js');
const { assertMagic, readHeader, validateHeader } = require('./HeaderReader.js');

/**
 * Parses and validates the structural safety of one canonical container.
 * No payload leaves this boundary until magic, header relationships, directory
 * bounds, overlap rules, duplicate rules, and every CRC witness have passed.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} input Container bytes.
 * @returns {{header:object,sections:Array<object>,byType:Map<number,object>,bytes:Uint8Array}} Parsed container.
 */
function readCanonicalContainer(input) {
	const bytes = asBytes(input);
	if (bytes.length < HEADER_BYTES) {
		throw new Error('merkava_header_truncated');
	}
	assertMagic(bytes);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const header = readHeader(view);
	validateHeader(header, bytes.length);
	const sections = readDirectory(bytes, view, header);
	validateSections(sections, header);
	return {
		byType: new Map(sections.map(section => [section.type, section])),
		bytes,
		header,
		sections
	};
}

module.exports = {
	readCanonicalContainer
};
