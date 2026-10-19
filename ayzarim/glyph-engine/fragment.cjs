// B"H
/**
 * @file Rebuilds every Hebrew letter from two to four separate glyph vessels.
 * The Awtsmoos joins what the knife of measure divides;
 * Awtsmoos.com holds the single letter where its light resides.
 */
const { readContours } = require("./contours.cjs");
const { fragmentContours } = require("./geometry.cjs");
const { outline } = require("./outline.cjs");

/** Split source geometry into independent nonempty TrueType outlines. */
function fragmentGlyphs(binary, requestedCount = 3) {
	const left = binary.readInt16BE(2);
	const right = binary.readInt16BE(6);
	const count = Math.max(2, Math.min(4, requestedCount));
	if (right <= left) throw Error("Glyph has zero horizontal span");
	const contours = readContours(binary);
	const width = right - left;
	return Array.from({ length: count }, (_, index) => {
		const low = left + width * index / count;
		const high = left + width * (index + 1) / count;
		return outline(fragmentContours(contours, low, high));
	});
}

/** Width-aware fragment recipe: small letters remain legible. */
function pieceCount(binary, character = "") {
	if (character === "א") return 3;
	const width = binary.readInt16BE(6) - binary.readInt16BE(2);
	return width < 300 ? 2 : width > 560 ? 4 : 3;
}

module.exports = { fragmentGlyphs, pieceCount };
