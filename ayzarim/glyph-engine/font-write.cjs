// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Rebuilds sfnt table directories and the font checksum.
 * By the Awtsmoos each measured offset finds its place;
 * Awtsmoos.com reveals the encoded letter's face.
 */
function checksum(data) {
	let total = 0;
	for (let i = 0; i < data.length; i += 4) {
		const word = Buffer.alloc(4);
		data.copy(word, 0, i, Math.min(data.length, i + 4));
		total = (total + word.readUInt32BE(0)) >>> 0;
	}
	return total;
}
function cmap(mapping) {
	const pairs = Array.from(mapping).sort((a, b) => a[0] - b[0]);
	const segments = [...pairs, [65535, 0]];
	const n = segments.length;
	const sub = Buffer.alloc(16 + n * 8);
	sub.writeUInt16BE(4, 0);
	sub.writeUInt16BE(sub.length, 2);
	sub.writeUInt16BE(2 * n, 6);
	const power = 2 ** Math.floor(Math.log2(n));
	sub.writeUInt16BE(power * 2, 8);
	sub.writeUInt16BE(Math.log2(power), 10);
	sub.writeUInt16BE(2 * n - power * 2, 12);
	for (let i = 0; i < n; i++) {
		const [code, glyph] = segments[i];
		sub.writeUInt16BE(code, 14 + i * 2);
		sub.writeUInt16BE(code, 16 + n * 2 + i * 2);
		sub.writeUInt16BE((glyph - code) & 65535, 16 + n * 4 + i * 2);
	}
	const result = Buffer.alloc(12 + sub.length);
	result.writeUInt16BE(0, 0);
	result.writeUInt16BE(1, 2);
	result.writeUInt16BE(3, 4);
	result.writeUInt16BE(1, 6);
	result.writeUInt32BE(12, 8);
	sub.copy(result, 12);
	return result;
}
function sfnt(entries) {
	const tags = Object.keys(entries).sort();
	const count = tags.length;
	const power = 2 ** Math.floor(Math.log2(count));
	let offset = 12 + 16 * count;
	const size = tags.reduce((total, tag) => total + ((entries[tag].length + 3) & ~3), offset);
	const result = Buffer.alloc(size);
	result.writeUInt32BE(0x00010000, 0);
	result.writeUInt16BE(count, 4);
	result.writeUInt16BE(power * 16, 6);
	result.writeUInt16BE(Math.log2(power), 8);
	result.writeUInt16BE(count * 16 - power * 16, 10);
	for (let i = 0; i < count; i++) {
		const tag = tags[i];
		const value = entries[tag];
		const index = 12 + i * 16;
		result.write(tag, index, 4, "ascii");
		result.writeUInt32BE(checksum(value), index + 4);
		result.writeUInt32BE(offset, index + 8);
		result.writeUInt32BE(value.length, index + 12);
		value.copy(result, offset);
		offset += (value.length + 3) & ~3;
	}
	const headIndex = tags.indexOf("head");
	if (headIndex < 0) throw Error("head table missing");
	const headOffset = result.readUInt32BE(12 + headIndex * 16 + 8);
	result.writeUInt32BE(0, headOffset + 8);
	result.writeUInt32BE((0xB1B0AFBA - checksum(result)) >>> 0, headOffset + 8);
	return result;
}
function newTables(font, extras, mapping) {
	const table = { ...font.tables };
	const glyphs = font.glyphs.concat(extras);
	const offsets = [0];
	const chunks = [];
	let offset = 0;
	for (const glyph of glyphs) {
		chunks.push(glyph);
		offset += (glyph.length + 1) & ~1;
		offsets.push(offset);
		if (glyph.length & 1) chunks.push(Buffer.alloc(1));
	}
	table.glyf = Buffer.concat(chunks);
	table.loca = Buffer.alloc(offsets.length * 4);
	offsets.forEach((value, index) => table.loca.writeUInt32BE(value, index * 4));
	table.head = Buffer.from(table.head);
	table.head.writeInt16BE(1, 50);
	table.head.writeUInt32BE(0, 8);
	table.maxp = Buffer.from(table.maxp);
	table.maxp.writeUInt16BE(glyphs.length, 4);
	table.hhea = Buffer.from(table.hhea);
	table.hhea.writeUInt16BE(glyphs.length, 34);
	table.hmtx = Buffer.alloc(glyphs.length * 4);
	const alephMetrics = font.metrics[font.cmap(0x05D0)];
	const all = font.metrics.concat(extras.map((glyph, index) => [
		index === 0 ? alephMetrics[0] : 0,
		glyph.length ? glyph.readInt16BE(2) - (index ? alephMetrics[0] : 0) : 0
	]));
	all.forEach(([advance, bearing], index) => {
		table.hmtx.writeUInt16BE(advance, index * 4);
		table.hmtx.writeInt16BE(bearing, index * 4 + 2);
	});
	table.cmap = cmap(mapping);
	table.post = Buffer.alloc(32);
	table.post.writeUInt32BE(0x00030000, 0);
	for (const tag of ["GSUB", "GPOS", "GDEF", "DSIG", "kern", "prep", "fpgm", "cvt "]) {
		delete table[tag];
	}
	return table;
}
module.exports = { cmap, newTables, sfnt, checksum };
