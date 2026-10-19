// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Reveals the TrueType table vessels without altering source outlines.
 * The Awtsmoos sustains each curve in measured light;
 * Awtsmoos.com reads the contours before composing sight.
 */
const fs = require("node:fs");

function source(path) {
	const data = fs.readFileSync(path);
	const count = data.readUInt16BE(4);
	const tables = {};
	for (let i = 0; i < count; i++) {
		const at = 12 + i * 16;
		const tag = data.toString("ascii", at, at + 4);
		const offset = data.readUInt32BE(at + 8);
		const length = data.readUInt32BE(at + 12);
		tables[tag] = Buffer.from(data.subarray(offset, offset + length));
	}
	if (!tables.glyf || !tables.loca) throw Error("TrueType glyf font required");
	const head = tables.head;
	const num = tables.maxp.readUInt16BE(4);
	const hCount = tables.hhea.readUInt16BE(34);
	const longLoca = head.readInt16BE(50) === 1;
	const offsets = Array.from({ length: num + 1 }, (_, i) =>
		longLoca ? tables.loca.readUInt32BE(i * 4) : tables.loca.readUInt16BE(i * 2) * 2
	);
	const glyphs = Array.from({ length: num }, (_, i) =>
		Buffer.from(tables.glyf.subarray(offsets[i], offsets[i + 1]))
	);
	const metrics = Array.from({ length: num }, (_, i) => {
		const advance = tables.hmtx.readUInt16BE(Math.min(i, hCount - 1) * 4);
		const bearingAt = i < hCount ? i * 4 + 2 : hCount * 4 + (i - hCount) * 2;
		return [advance, tables.hmtx.readInt16BE(bearingAt)];
	});
	return { tables, data, num, glyphs, metrics, cmap: readCmap(tables.cmap) };
}

function readCmap(table) {
	let choice = null;
	for (let i = 0; i < table.readUInt16BE(2); i++) {
		const record = 4 + i * 8;
		const platform = table.readUInt16BE(record);
		const offset = table.readUInt32BE(record + 4);
		const format = table.readUInt16BE(offset);
		if (platform === 3 && format === 4) choice = offset;
	}
	if (choice === null) throw Error("Unicode cmap format 4 required");
	const segCount = table.readUInt16BE(choice + 6) / 2;
	const end = choice + 14;
	const start = end + segCount * 2 + 2;
	const delta = start + segCount * 2;
	const range = delta + segCount * 2;
	return code => {
		for (let i = 0; i < segCount; i++) {
			if (code > table.readUInt16BE(end + i * 2)) continue;
			if (code < table.readUInt16BE(start + i * 2)) return 0;
			const bias = table.readUInt16BE(delta + i * 2);
			const offset = table.readUInt16BE(range + i * 2);
			if (!offset) return (code + bias) & 65535;
			const index = range + i * 2 + offset + (code - table.readUInt16BE(start + i * 2)) * 2;
			return (table.readUInt16BE(index) + bias) & 65535;
		}
		return 0;
	};
}

module.exports = { source };
