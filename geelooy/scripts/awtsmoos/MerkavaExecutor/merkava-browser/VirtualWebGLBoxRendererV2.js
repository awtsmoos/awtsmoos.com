//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualWebGLBoxRenderer.js"),
			require("./CssColorResolver.js"),
			require("./VirtualWebGLBoxPaintGeometry.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualWebGLBoxRendererV2 = factory(
			root.Merkava,
			root.Merkava,
			root.Merkava
		).VirtualWebGLBoxRendererV2;
	}
})(typeof self !== "undefined" ? self : this, function(baseMod, colorMod, geometryMod) {
	const BaseRenderer = baseMod.VirtualWebGLBoxRenderer;
	const CssColorResolver = colorMod.CssColorResolver;

	/**
	 * Corrects paint geometry without disturbing the mature flow/layout engine.
	 * The legacy renderer's `outerWidth/outerHeight` intentionally include margins
	 * for sibling placement; paint operations must instead use the border box.
	 */
	class VirtualWebGLBoxRendererV2 extends BaseRenderer {
		constructor(arena, options = {}) {
			super(arena, options);
			this.cssColors = new CssColorResolver();
		}

		/** Records clips, radius, opacity, and transforms against the border box. */
		paintCompositingHints(texture, placed, metrics, style) {
			const box = geometryMod.visualBox(metrics);
			const radius = geometryMod.paintLength(style["border-radius"], Math.min(box.width, box.height));
			if (geometryMod.isPaintClipped(style)) {
				this.arena.record(texture, "paintClipPush", geometryMod.paintRect(placed, box, { radius }));
			}
			if (radius > 0) {
				this.arena.record(texture, "paintBorderRadius", geometryMod.paintRect(placed, box, { radius }));
			}
			const alpha = geometryMod.boundedOpacity(style.opacity);
			if (alpha < 1) {
				this.arena.record(texture, "paintOpacity", geometryMod.paintRect(placed, box, { alpha }));
			}
			if (style.transform && style.transform !== "none") {
				this.arena.record(texture, "paintTransform", geometryMod.paintRect(placed, box, { transform: style.transform }));
			}
		}

		/** Emits the matching clip-pop using the same border-box geometry. */
		paintClipPopIfNeeded(texture, placed, metrics, style) {
			if (geometryMod.isPaintClipped(style)) {
				this.arena.record(texture, "paintClipPop", geometryMod.paintRect(placed, geometryMod.visualBox(metrics)));
			}
		}

		/** Paints backgrounds and borders without allowing margins into raster size. */
		paintVisual(_element, texture, placed, metrics, style) {
			const box = geometryMod.visualBox(metrics);
			const background = this.resolveColor(style["background-color"] || "transparent", style.color);
			const border = this.resolveColor(style["border-color"] || "transparent", style.color);
			if (!geometryMod.isTransparentPaint(background)) {
				this.arena.record(texture, "paintBox", geometryMod.paintRect(placed, box, {
					background,
					border: metrics.borderTop,
					color: this.resolveColor(style.color || "black"),
					display: style.display || "block",
					margin: metrics.marginTop,
					padding: metrics.paddingTop
				}));
			}
			const borderWidth = Math.max(metrics.borderTop, metrics.borderRight, metrics.borderBottom, metrics.borderLeft);
			if (borderWidth > 0 && !geometryMod.isTransparentPaint(border)) {
				this.arena.record(texture, "paintBorder", geometryMod.paintRect(placed, box, { color: border, widthPx: borderWidth }));
			}
			if (style["box-shadow"]) {
				this.arena.record(texture, "paintShadow", geometryMod.paintRect({ x: placed.x + 3, y: placed.y + 3 }, box, { color: "#000000" }));
			}
			for (const operation of this.imagePaint.backgroundLayers(style, geometryMod.paintRect(placed, box))) {
				this.arena.record(texture, operation.op, operation);
			}
		}

		/** Keeps replaced canvas/image paint surfaces on their border boxes. */
		paintReplaced(element, texture, placed, metrics, style) {
			const box = geometryMod.visualBox(metrics);
			if (element.localName === "img") {
				const operation = this.imagePaint.imageElement(element, geometryMod.paintRect(placed, box), style);
				this.arena.record(texture, operation.op, operation);
			}
			if (element.localName === "canvas") {
				this.arena.record(texture, "paintBox", geometryMod.paintRect(placed, box, {
					background: this.resolveColor(style["background-color"] || "#102038", style.color),
					color: this.resolveColor(style.color || "white"),
					display: style.display || "block"
				}));
			}
			return metrics;
		}

		/** @returns {string} Stable internal sRGB token. */
		resolveColor(value, current = "#000000") {
			return this.cssColors.normalize(value, current);
		}
	}


	return { VirtualWebGLBoxRendererV2 };
});
