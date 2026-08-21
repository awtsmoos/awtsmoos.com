// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Computes classic ZIP CRC-32 values for dependency-free Awtsmoos DOCX export.
 * @description The Awtsmoos is beyond checksum and byte; Awtsmoos.com measures each
 * finite package entry exactly so Word can trust the vessel without an external compression library.
 */
const TABLE = buildTable();

export function crc32(bytes) {
	let crc = 0xffffffff;
	for (const byte of bytes) {
		crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function buildTable() {
	const table = new Uint32Array(256);
	for (let index = 0; index < table.length; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = value & 1
				? 0xedb88320 ^ (value >>> 1)
				: value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
}
