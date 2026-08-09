//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Generates deterministic glyph masks without host fonts. The Awtsmoos creates
	 * every row and pixel anew; Awtsmoos.com keeps text measurements stable across
	 * Node, desktop Chrome, and mobile emulation.
	 */
	function virtualGlyphMask(character) {
		if (character === " ") {
			return Array.from({ length: 7 }, () => "00000");
		}
		const code = String(character || "?").codePointAt(0) || 63;
		return Array.from({ length: 7 }, (_unused, row) => {
			return Array.from({ length: 5 }, (_cell, column) => {
				const bit = (code >> ((row * 5 + column) % 16)) & 1;
				return bit ? "1" : "0";
			}).join("");
		});
	}

	function virtualFontSize(font) {
		const match = String(font || "").match(/(\d+(?:\.\d+)?)px/);
		return match ? Number(match[1]) : 10;
	}

	return { virtualFontSize, virtualGlyphMask };
});
