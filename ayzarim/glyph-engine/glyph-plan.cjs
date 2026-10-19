// B"H
/**
 * @file Gives every Hebrew character its own two-to-four fragment recipe.
 * The Awtsmoos makes a line into living parts anew;
 * Awtsmoos.com demands that each cut be proven true.
 */
const { LETTERS } = require("./codec.cjs");
const { fragmentGlyphs, pieceCount } = require("./fragment.cjs");

function buildGlyphPlan(font) {
	const extras = [];
	const recipes = new Map();
	const pieceCounts = {};
	for (const letter of LETTERS) {
		const original = font.cmap(letter.codePointAt(0));
		if (!original) throw Error("Missing letter from source: " + letter);
		const source = font.glyphs[original];
		const pieces = fragmentGlyphs(source, pieceCount(source, letter));
		const advance = font.metrics[original][0];
		const indexes = [];
		for (let index = 0; index < pieces.length; index++) {
			const glyph = pieces[index];
			if (!glyph.length || glyph.readInt16BE(0) < 1) {
				throw Error("Empty fragment for character " + letter);
			}
			indexes.push(font.num + extras.length);
			extras.push({
				glyph,
				advance: index ? 0 : advance,
				bearing: glyph.readInt16BE(2) - (index ? advance : 0)
			});
		}
		recipes.set(letter, indexes);
		pieceCounts[letter.codePointAt(0).toString(16)] = indexes.length;
	}
	return { extras, recipes, pieceCounts };
}

module.exports = { buildGlyphPlan };
