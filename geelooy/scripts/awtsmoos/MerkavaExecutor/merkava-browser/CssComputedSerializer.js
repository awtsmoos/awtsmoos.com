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
	const colorProperties = new Set([
		"background-color", "border-bottom-color", "border-left-color",
		"border-right-color", "border-top-color", "caret-color", "color",
		"column-rule-color", "outline-color", "text-decoration-color"
	]);

	/**
	 * Serializes one already-computed property for the CSSOM-facing surface.
	 * Internal paint values intentionally remain compact hex/rgba tokens while
	 * getComputedStyle exposes the interoperable rgb()/rgba() representation.
	 * @param {string} name Canonical CSS property name.
	 * @param {*} value Internal computed value.
	 * @returns {*} CSSOM-facing value.
	 */
	function serializeComputedProperty(name, value) {
		if (!colorProperties.has(String(name || "").toLowerCase())) {
			return value;
		}
		return serializeColor(value);
	}

	/** @param {*} value Internal color value. @returns {string} Serialized color. */
	function serializeColor(value) {
		const text = String(value ?? "").trim();
		const hex = text.match(/^#([0-9a-f]{6})$/i);
		if (hex) {
			const number = parseInt(hex[1], 16);
			const red = number >> 16 & 255;
			const green = number >> 8 & 255;
			const blue = number & 255;
			return `rgb(${red}, ${green}, ${blue})`;
		}
		const rgba = text.match(/^rgba\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
		if (rgba) {
			return `rgba(${rgba[1].trim()}, ${rgba[2].trim()}, ${rgba[3].trim()}, ${rgba[4].trim()})`;
		}
		return text;
	}

	/** Serializes a complete computed declaration object without mutating it. */
	function serializeComputedStyle(style = {}) {
		const output = Object.create(null);
		for (const [name, value] of Object.entries(style)) {
			output[name] = serializeComputedProperty(name, value);
		}
		return output;
	}

	return {
		serializeComputedProperty,
		serializeComputedStyle
	};
});
