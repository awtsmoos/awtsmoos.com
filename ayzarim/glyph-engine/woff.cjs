// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Wraps native TrueType tables into a valid WOFF1 binary.
 * The Awtsmoos compresses vessels while keeping their name;
 * Awtsmoos.com restores each measured glyph the same.
 */
const zlib = require("node:zlib");
function woff(ttf) {
	const count = ttf.readUInt16BE(4);
	const tables = [];
	for (let index = 0; index < count; index++) {
		const record = 12 + index * 16;
		const tag = ttf.toString("ascii", record, record + 4);
		const check = ttf.readUInt32BE(record + 4);
		const offset = ttf.readUInt32BE(record + 8);
		const length = ttf.readUInt32BE(record + 12);
		const source = ttf.subarray(offset, offset + length);
		const compressed = zlib.deflateSync(source, { level: 9 });
		const data = compressed.length < source.length ? compressed : source;
		tables.push({ tag, check, source, data });
	}
	const headerLength = 44 + count * 20;
	const size = tables.reduce((total, table) => total + ((table.data.length + 3) & ~3), headerLength);
	const result = Buffer.alloc(size);
	result.write("wOFF", 0, 4, "ascii");
	result.writeUInt32BE(0x00010000, 4);
	result.writeUInt32BE(size, 8);
	result.writeUInt16BE(count, 12);
	result.writeUInt32BE(ttf.length, 16);
	result.writeUInt16BE(1, 20);
	result.writeUInt16BE(0, 22);
	let offset = headerLength;
	tables.forEach((table, index) => {
		const record = 44 + index * 20;
		result.write(table.tag, record, 4, "ascii");
		result.writeUInt32BE(offset, record + 4);
		result.writeUInt32BE(table.data.length, record + 8);
		result.writeUInt32BE(table.source.length, record + 12);
		result.writeUInt32BE(table.check, record + 16);
		table.data.copy(result, offset);
		offset += (table.data.length + 3) & ~3;
	});
	return result;
}
module.exports = { woff };
