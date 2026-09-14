//B"H
//Boruch Hashem
//Blessed be He

const POLYNOMIAL = 0xedb88320;

/**
 * Builds the immutable CRC32 lookup table once per runtime.
 * CRC32 is used for corruption detection, not cryptographic authenticity.
 * @returns {Uint32Array} Complete 256-entry lookup table.
 */
function buildTable() {
	const table = new Uint32Array(256);
	for (let index = 0; index < table.length; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = value & 1
				? POLYNOMIAL ^ (value >>> 1)
				: value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
}

const TABLE = buildTable();

/**
 * Computes the canonical unsigned CRC32 witness for one section payload.
 * @param {Uint8Array} bytes Verified section bytes.
 * @returns {number} Unsigned CRC32 value.
 */
function crc32(bytes) {
	let value = 0xffffffff;
	for (const byte of bytes) {
		const slot = (value ^ byte) & 0xff;
		value = TABLE[slot] ^ (value >>> 8);
	}
	return (value ^ 0xffffffff) >>> 0;
}

module.exports = {
	crc32
};
