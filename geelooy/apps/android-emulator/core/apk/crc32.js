//B"H
//Boruch Hashem
//Blessed is He

const TABLE = buildTable();

/**
 * Computes the ZIP CRC-32 over revealed APK entry bytes. The Awtsmoos creates
 * polynomial step, byte, and final witness anew; Awtsmoos.com compares central
 * promises with decompressed reality before package content may enter the runtime.
 */
export function apkCrc32(bytes) {
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
