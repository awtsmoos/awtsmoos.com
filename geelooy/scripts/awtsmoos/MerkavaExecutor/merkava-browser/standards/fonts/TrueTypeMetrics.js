//B"H
//Boruch Hashem
//Blessed be He

const { requireSfntTable } = require("./SfntDirectory.js");

/** Parses core horizontal metrics needed for layout before glyph rasterization. */
function parseTrueTypeMetrics(directory) {
	const reader = directory.reader;
	const head = requireSfntTable(directory, "head");
	const hhea = requireSfntTable(directory, "hhea");
	const maxp = requireSfntTable(directory, "maxp");
	const hmtx = requireSfntTable(directory, "hmtx");
	const unitsPerEm = reader.u16(head.offset + 18);
	const ascent = reader.i16(hhea.offset + 4);
	const descent = reader.i16(hhea.offset + 6);
	const lineGap = reader.i16(hhea.offset + 8);
	const metricCount = reader.u16(hhea.offset + 34);
	const glyphCount = reader.u16(maxp.offset + 4);
	if (!unitsPerEm || !metricCount || metricCount > glyphCount) {
		throw new Error("Invalid TrueType horizontal metric counts");
	}
	reader.assertRange(hmtx.offset, metricCount * 4);
	return Object.freeze({
		ascent,
		descent,
		glyphCount,
		lineGap,
		metricCount,
		unitsPerEm,
		advanceWidth(glyphId) {
			return advanceWidth(reader, hmtx.offset, metricCount, glyphCount, glyphId);
		},
		leftSideBearing(glyphId) {
			return leftSideBearing(reader, hmtx.offset, metricCount, glyphCount, glyphId);
		}
	});
}

function advanceWidth(reader, base, metricCount, glyphCount, glyphId) {
	const glyph = clampGlyph(glyphId, glyphCount);
	const metric = Math.min(glyph, metricCount - 1);
	return reader.u16(base + metric * 4);
}

function leftSideBearing(reader, base, metricCount, glyphCount, glyphId) {
	const glyph = clampGlyph(glyphId, glyphCount);
	if (glyph < metricCount) return reader.i16(base + glyph * 4 + 2);
	const bearings = base + metricCount * 4;
	return reader.i16(bearings + (glyph - metricCount) * 2);
}

function clampGlyph(glyphId, glyphCount) {
	const glyph = Number(glyphId);
	if (!Number.isInteger(glyph) || glyph < 0 || glyph >= glyphCount) return 0;
	return glyph;
}

module.exports = { parseTrueTypeMetrics };
