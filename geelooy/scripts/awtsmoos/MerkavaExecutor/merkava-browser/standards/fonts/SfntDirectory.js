//B"H
//Boruch Hashem
//Blessed be He

const { SfntReader } = require("./SfntReader.js");

/** Parses and validates the SFNT offset table and table directory. */
function parseSfntDirectory(bytes) {
	const reader = new SfntReader(bytes);
	if (reader.bytes.length < 12) throw new Error("SFNT header is truncated");
	const scalerType = reader.u32(0);
	const tableCount = reader.u16(4);
	if (!isSupportedScaler(scalerType)) throw new Error(`Unsupported SFNT scaler: ${scalerType}`);
	reader.assertRange(12, tableCount * 16);
	const tables = new Map();
	for (let index = 0; index < tableCount; index += 1) {
		const at = 12 + index * 16;
		const tag = reader.tag(at);
		const checksum = reader.u32(at + 4);
		const offset = reader.u32(at + 8);
		const length = reader.u32(at + 12);
		reader.assertRange(offset, length);
		if (tables.has(tag)) throw new Error(`Duplicate SFNT table: ${tag}`);
		tables.set(tag, Object.freeze({ checksum, length, offset, tag }));
	}
	return Object.freeze({ reader, scalerType, tableCount, tables });
}

/** Returns one required table record or throws a deterministic format error. */
function requireSfntTable(directory, tag) {
	const table = directory.tables.get(tag);
	if (!table) throw new Error(`Required SFNT table missing: ${tag}`);
	return table;
}

function isSupportedScaler(value) {
	return value === 0x00010000 || value === 0x4f54544f || value === 0x74727565 || value === 0x74797031;
}

module.exports = { parseSfntDirectory, requireSfntTable };
