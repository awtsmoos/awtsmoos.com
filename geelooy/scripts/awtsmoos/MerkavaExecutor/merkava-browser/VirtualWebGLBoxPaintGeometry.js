//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/** Returns paintable border-box dimensions while preserving margin-box flow. */
	function visualBox(metrics) {
		return {
			height: Math.max(0, metrics.outerHeight - metrics.marginTop - metrics.marginBottom),
			width: Math.max(0, metrics.outerWidth - metrics.marginLeft - metrics.marginRight)
		};
	}

	/** Creates a deterministic rectangular render operation payload. */
	function paintRect(placed, box, extra = {}) {
		return {
			x: placed.x,
			y: placed.y,
			width: box.width,
			height: box.height,
			...extra
		};
	}

	/** Reports whether overflow semantics establish a paint clip. */
	function isPaintClipped(style) {
		return [style.overflow, style["overflow-x"], style["overflow-y"]]
			.some(value => value === "hidden" || value === "clip");
	}

	/** Recognizes internal fully transparent color tokens. */
	function isTransparentPaint(value) {
		return value === "transparent" || value === "rgba(0,0,0,0)";
	}

	/** Clamps opacity into its CSS used-value interval. */
	function boundedOpacity(value) {
		const number = Number.parseFloat(String(value ?? "1"));
		return Number.isFinite(number)
			? Math.max(0, Math.min(1, number))
			: 1;
	}

	/** Resolves the subset of radius values required by border-box paint hints. */
	function paintLength(value, basis) {
		const text = String(value || "0").trim();
		if (text.endsWith("%")) {
			return (Number.parseFloat(text) || 0) * basis / 100;
		}
		return Number.parseFloat(text) || 0;
	}

	return {
		boundedOpacity,
		isPaintClipped,
		isTransparentPaint,
		paintLength,
		paintRect,
		visualBox
	};
});
