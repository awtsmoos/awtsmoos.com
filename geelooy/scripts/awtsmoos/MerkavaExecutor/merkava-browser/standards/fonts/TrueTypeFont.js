//B"H
//Boruch Hashem
//Blessed be He

const { parseSfntDirectory } = require("./SfntDirectory.js");
const { parseTrueTypeCmap } = require("./TrueTypeCmap.js");
const { parseTrueTypeMetrics } = require("./TrueTypeMetrics.js");

/**
 * From-scratch TrueType/OpenType facade for Unicode mapping and horizontal layout.
 * Rendering code consumes font bytes through this object rather than host font APIs.
 */
class TrueTypeFont {
	constructor(bytes) {
		this.directory = parseSfntDirectory(bytes);
		this.cmap = parseTrueTypeCmap(this.directory);
		this.metrics = parseTrueTypeMetrics(this.directory);
	}

	/** Maps one Unicode code point to its font glyph identifier. */
	glyphId(codePoint) {
		return this.cmap.glyphId(Number(codePoint));
	}

	/** Returns one glyph's horizontal advance in font design units. */
	advanceWidth(glyphId) {
		return this.metrics.advanceWidth(glyphId);
	}

	/** Returns one glyph's left side bearing in font design units. */
	leftSideBearing(glyphId) {
		return this.metrics.leftSideBearing(glyphId);
	}

	/** Converts a design-unit measure into CSS pixels for a requested font size. */
	toPixels(designUnits, fontSize) {
		return Number(designUnits) * Number(fontSize) / this.metrics.unitsPerEm;
	}

	/** Measures unshaped code points using real cmap and hmtx data. */
	measureCodePoints(text, fontSize) {
		let designWidth = 0;
		const glyphs = [];
		for (const character of String(text || "")) {
			const codePoint = character.codePointAt(0);
			const glyphId = this.glyphId(codePoint);
			const advance = this.advanceWidth(glyphId);
			glyphs.push(Object.freeze({ advance, codePoint, glyphId }));
			designWidth += advance;
		}
		return Object.freeze({
			designWidth,
			glyphs: Object.freeze(glyphs),
			width: this.toPixels(designWidth, fontSize)
		});
	}
}

module.exports = { TrueTypeFont };
