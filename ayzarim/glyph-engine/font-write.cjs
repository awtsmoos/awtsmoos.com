// B"H
/**
 * @file Rebuilds sfnt tables, metrics, cmap, outlines and checksum.
 * The Awtsmoos counts each vessel that returns;
 * Awtsmoos.com keeps the checksum while the letter burns.
 */
function checksum(data) {
	let sum = 0;
	for (let offset = 0; offset < data.length; offset += 4) {
		const word = Buffer.alloc(4);
		data.copy(word, 0, offset, Math.min(offset + 4, data.length));
		sum = (sum + word.readUInt32BE(0)) >>> 0;
	}
	return sum;
}
function cmap(mapping) {
	const entries = [...mapping].sort((a, b) => a[0] - b[0]);
	const segments = [...entries, [65535, 0]];
	const count = segments.length;
	const sub = Buffer.alloc(16 + count * 8);
	sub.writeUInt16BE(4, 0);
	sub.writeUInt16BE(sub.length, 2);
	sub.writeUInt16BE(count * 2, 6);
	const power = 2 ** Math.floor(Math.log2(count));
	sub.writeUInt16BE(power * 2, 8);
	sub.writeUInt16BE(Math.log2(power), 10);
	sub.writeUInt16BE(count * 2 - power * 2, 12);
	for (let index = 0; index < count; index++) {
		const [code, glyph] = segments[index];
		sub.writeUInt16BE(code, 14 + index * 2);
		sub.writeUInt16BE(code, 16 + count * 2 + index * 2);
		sub.writeUInt16BE((glyph - code) & 65535, 16 + count * 4 + index * 2);
	}
	const result = Buffer.alloc(12 + sub.length);
	result.writeUInt16BE(1, 2);
	result.writeUInt16BE(3, 4);
	result.writeUInt16BE(1, 6);
	result.writeUInt32BE(12, 8);
	sub.copy(result, 12);
	return result;
}
function sfnt(tables) {
	const tags = Object.keys(tables).sort();
	const count = tags.length;
	const power = 2 ** Math.floor(Math.log2(count));
	let offset = 12 + count * 16;
	const bytes = tags.reduce((sum, tag) => sum + ((tables[tag].length + 3) & ~3), offset);
	const result = Buffer.alloc(bytes);
	result.writeUInt32BE(0x00010000, 0);
	result.writeUInt16BE(count, 4);
	result.writeUInt16BE(power * 16, 6);
	result.writeUInt16BE(Math.log2(power), 8);
	result.writeUInt16BE(count * 16 - power * 16, 10);
	for (let index = 0; index < count; index++) {
		const tag = tags[index];
		const data = tables[tag];
		const record = 12 + 16 * index;
		result.write(tag, record, 4, "ascii");
		result.writeUInt32BE(checksum(data), record + 4);
		result.writeUInt32BE(offset, record + 8);
		result.writeUInt32BE(data.length, record + 12);
		data.copy(result, offset);
		offset += (data.length + 3) & ~3;
	}
	const head = result.readUInt32BE(12 + tags.indexOf("head") * 16 + 8);
	result.writeUInt32BE(0, head + 8);
	result.writeUInt32BE((0xB1B0AFBA - checksum(result)) >>> 0, head + 8);
	return result;
}
function newTables(font, extras, mapping) {
	const tables = { ...font.tables };
	const glyphs = font.glyphs.concat(extras.map(item => item.glyph));
	const positions = [0];
	const chunks = [];
	let offset = 0;
	for (const glyph of glyphs) {
		chunks.push(glyph);
		if (glyph.length & 1) chunks.push(Buffer.alloc(1));
		offset += (glyph.length + 1) & ~1;
		positions.push(offset);
	}
	tables.glyf = Buffer.concat(chunks);
	tables.loca = Buffer.alloc(positions.length * 4);
	positions.forEach((position, index) => tables.loca.writeUInt32BE(position, index * 4));
	tables.head = Buffer.from(tables.head);
	tables.head.writeInt16BE(1, 50);
	tables.head.writeUInt32BE(0, 8);
	tables.hhea = Buffer.from(tables.hhea);
	tables.hhea.writeUInt16BE(glyphs.length, 34);
	tables.maxp = Buffer.from(tables.maxp);
	tables.maxp.writeUInt16BE(glyphs.length, 4);
	if (tables.maxp.length >= 10) {
		const points = extras.map(item => {
			const glyph = item.glyph;
			const contours = glyph.readInt16BE(0);
			return [contours, glyph.readUInt16BE(10 + (contours - 1) * 2) + 1];
		});
		tables.maxp.writeUInt16BE(Math.max(tables.maxp.readUInt16BE(6), ...points.map(p => p[1])), 6);
		tables.maxp.writeUInt16BE(Math.max(tables.maxp.readUInt16BE(8), ...points.map(p => p[0])), 8);
	}
	tables.hmtx = Buffer.alloc(glyphs.length * 4);
	const metrics = font.metrics.concat(extras.map(item => [item.advance, item.bearing]));
	metrics.forEach(([advance, bearing], index) => {
		tables.hmtx.writeUInt16BE(advance, index * 4);
		tables.hmtx.writeInt16BE(bearing, index * 4 + 2);
	});
	tables.cmap = cmap(mapping);
	tables.post = Buffer.alloc(32);
	tables.post.writeUInt32BE(0x00030000, 0);
	for (const tag of ["GSUB", "GPOS", "GDEF", "DSIG", "kern", "prep", "fpgm", "cvt "]) delete tables[tag];
	return tables;
}
module.exports = { cmap, newTables, sfnt, checksum };
