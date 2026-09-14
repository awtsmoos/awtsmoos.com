//B"H
//Boruch Hashem
//Blessed be He

/**
 * Canonical Merkava container constants.
 *
 * This module is the single numerical authority for the outer `.merkava`
 * garment. Internal execution encodings may evolve behind BYTECODE sections,
 * while container readers remain deterministic, bounds-checkable, and stable.
 */
const CANONICAL_MAGIC = Object.freeze([0x4d, 0x4b, 0x56, 0x31]);
const CONTAINER_VERSION = 1;
const ISA_VERSION = 1;
const HOST_ABI_VERSION = 1;
const HEADER_BYTES = 32;
const DIRECTORY_ENTRY_BYTES = 20;
const MAX_SECTIONS = 128;

/** Canonical section identifiers. Values below 0x8000 are reserved by Merkava. */
const SECTION = Object.freeze({
	MANIFEST: 1,
	STRINGS: 2,
	DOM: 3,
	STYLES: 4,
	FUNCTIONS: 5,
	BYTECODE: 6,
	MODULES: 7,
	ASSETS: 8,
	DEBUG: 9,
	CAPABILITIES: 10,
	SIGNATURE: 11,
	SOURCE: 12
});

const SECTION_NAMES = Object.freeze(
	Object.fromEntries(
		Object.entries(SECTION).map(([name, value]) => [value, name])
	)
);

/**
 * Resolves a numeric section identifier to its stable display name.
 * Unknown extension identifiers remain inspectable rather than crashing tools.
 * @param {number} id Section identifier.
 * @returns {string} Stable section name.
 */
function sectionName(id) {
	return SECTION_NAMES[id] || `EXTENSION_${id}`;
}

/**
 * Resolves a canonical name to its numeric section identifier.
 * @param {string} name Canonical section name.
 * @returns {number} Section identifier.
 */
function sectionId(name) {
	const id = SECTION[String(name || '').toUpperCase()];
	if (!id) {
		throw new Error(`unknown_merkava_section:${name}`);
	}
	return id;
}

module.exports = {
	CANONICAL_MAGIC,
	CONTAINER_VERSION,
	DIRECTORY_ENTRY_BYTES,
	HEADER_BYTES,
	HOST_ABI_VERSION,
	ISA_VERSION,
	MAX_SECTIONS,
	SECTION,
	sectionId,
	sectionName
};
