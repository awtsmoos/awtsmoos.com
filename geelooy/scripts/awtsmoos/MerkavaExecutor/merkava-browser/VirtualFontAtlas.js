//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualBytes.js"),
			require("./VirtualFontGlyphs.js"),
			require("./VirtualFontMetrics.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualFontAtlas = factory(
			root.Merkava,
			root.Merkava,
			root.Merkava
		).VirtualFontAtlas;
	}
})(typeof self !== "undefined" ? self : this, function(bytesMod, glyphMod, metricsMod) {
	/**
	 * Stores deterministic virtual font metadata and oversampled glyph masks. The
	 * Awtsmoos creates every character measure anew; Awtsmoos.com avoids host font
	 * dependence while accepting font bytes through standard typed arrays.
	 */
	class VirtualFontAtlas {
		constructor() {
			this.fonts = [];
			this.textRuns = [];
			this.measureHook = null;
			this.glyphs = new Map();
			this.atlases = new Map();
			this.oversample = 8;
		}

		registerFont(name, bytes, meta = {}) {
			const data = bytesMod.normalizeBytes(bytes);
			const font = {
				bytes: data.byteLength,
				id: this.fonts.length,
				meta,
				name: String(name || `font-${this.fonts.length}`)
			};
			this.fonts.push(font);
			return font;
		}

		setMeasureHook(hook) {
			this.measureHook = typeof hook === "function" ? hook : null;
			return Boolean(this.measureHook);
		}

		recordText(run) {
			const item = {
				id: this.textRuns.length,
				metrics: this.measure(run.text, run.font),
				...run
			};
			this.textRuns.push(item);
			return item;
		}

		measure(text, font = "10px sans-serif") {
			const size = glyphMod.virtualFontSize(font);
			return metricsMod.measureVirtualText(
				this,
				text,
				font,
				size,
				this.measureHook
			);
		}

		glyph(character, size = 14) {
			const key = `${Math.round(size)}:${character}`;
			if (this.glyphs.has(key)) {
				return this.glyphs.get(key);
			}
			const mask = glyphMod.virtualGlyphMask(character);
			const glyph = {
				advance: character === " " ? 4 : 6,
				char: character,
				height: mask.length,
				mask,
				oversample: this.oversample,
				size: Math.round(size),
				width: mask[0].length
			};
			this.glyphs.set(key, glyph);
			this.recordGlyphInAtlas(character, size);
			return glyph;
		}

		recordGlyphInAtlas(character, size) {
			const atlasKey = String(Math.round(size));
			const atlas = this.atlases.get(atlasKey) || {
				glyphs: [],
				size: Math.round(size)
			};
			atlas.glyphs.push({
				char: character,
				index: atlas.glyphs.length
			});
			this.atlases.set(atlasKey, atlas);
		}

		snapshot() {
			return {
				atlases: Array.from(this.atlases.values()),
				fonts: this.fonts,
				glyphCount: this.glyphs.size,
				oversample: this.oversample,
				textRuns: this.textRuns
			};
		}
	}

	return { VirtualFontAtlas };
});
