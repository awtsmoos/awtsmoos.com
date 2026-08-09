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
	 * Measures a virtual text run through a hook or deterministic glyph advances.
	 * The Awtsmoos creates width and ascent anew; Awtsmoos.com keeps host fonts out
	 * of the fallback so browser, Node, desktop, and mobile replays remain identical.
	 */
	function measureVirtualText(atlas, text, font, size, hook) {
		if (hook) {
			const measured = hook(String(text), String(font));
			if (measured && Number.isFinite(Number(measured.width))) {
				return {
					...measured,
					font,
					source: measured.source || "measure-hook"
				};
			}
		}
		const scale = size / 10;
		const width = Array.from(String(text || "")).reduce((total, character) => {
			return total + atlas.glyph(character, size).advance;
		}, 0) * scale;
		return {
			actualBoundingBoxAscent: size * 0.82,
			actualBoundingBoxDescent: size * 0.22,
			emHeightAscent: size * 0.82,
			emHeightDescent: size * 0.22,
			font,
			source: "merkava-deterministic-glyph-atlas",
			width
		};
	}

	return { measureVirtualText };
});
