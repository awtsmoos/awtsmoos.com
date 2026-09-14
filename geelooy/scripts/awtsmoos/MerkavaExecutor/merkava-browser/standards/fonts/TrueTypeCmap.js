//B"H
//Boruch Hashem
//Blessed be He

const { requireSfntTable } = require("./SfntDirectory.js");

/** Selects the strongest supported Unicode cmap subtable, preferring format 12. */
function parseTrueTypeCmap(directory) {
	const table = requireSfntTable(directory, "cmap");
	const reader = directory.reader;
	const base = table.offset;
	const count = reader.u16(base + 2);
	let best = null;
	for (let index = 0; index < count; index += 1) {
		const record = base + 4 + index * 8;
		const platform = reader.u16(record);
		const encoding = reader.u16(record + 2);
		const offset = reader.u32(record + 4);
		const subtable = base + offset;
		const format = reader.u16(subtable);
		const rank = cmapRank(platform, encoding, format);
		if (rank > (best?.rank || 0)) best = { format, offset: subtable, rank };
	}
	if (!best) throw new Error("No supported Unicode cmap subtable");
	return Object.freeze({
		format: best.format,
		glyphId(codePoint) {
			return best.format === 12
				? glyphFromFormat12(reader, best.offset, codePoint)
				: glyphFromFormat4(reader, best.offset, codePoint);
		}
	});
}

function cmapRank(platform, encoding, format) {
	if (format === 12 && platform === 3 && encoding === 10) return 5;
	if (format === 12 && platform === 0) return 4;
	if (format === 4 && platform === 3 && (encoding === 1 || encoding === 10)) return 3;
	if (format === 4 && platform === 0) return 2;
	return 0;
}

function glyphFromFormat12(reader, base, codePoint) {
	const count = reader.u32(base + 12);
	let low = 0;
	let high = count - 1;
	while (low <= high) {
		const middle = (low + high) >> 1;
		const at = base + 16 + middle * 12;
		const start = reader.u32(at);
		const end = reader.u32(at + 4);
		if (codePoint < start) high = middle - 1;
		else if (codePoint > end) low = middle + 1;
		else return reader.u32(at + 8) + codePoint - start;
	}
	return 0;
}

function glyphFromFormat4(reader, base, codePoint) {
	if (codePoint > 0xffff) return 0;
	const segmentCount = reader.u16(base + 6) / 2;
	const endCodes = base + 14;
	const startCodes = endCodes + segmentCount * 2 + 2;
	const deltas = startCodes + segmentCount * 2;
	const offsets = deltas + segmentCount * 2;
	for (let index = 0; index < segmentCount; index += 1) {
		const end = reader.u16(endCodes + index * 2);
		if (codePoint > end) continue;
		const start = reader.u16(startCodes + index * 2);
		if (codePoint < start) return 0;
		const delta = reader.i16(deltas + index * 2);
		const rangeOffset = reader.u16(offsets + index * 2);
		if (!rangeOffset) return codePoint + delta & 0xffff;
		const glyphAt = offsets + index * 2 + rangeOffset + (codePoint - start) * 2;
		const glyph = reader.u16(glyphAt);
		return glyph ? glyph + delta & 0xffff : 0;
	}
	return 0;
}

module.exports = { parseTrueTypeCmap };
