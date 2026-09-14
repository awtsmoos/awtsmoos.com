//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./CssNamedColorsAtoL.js"),
			require("./CssNamedColorsMtoZ.js"),
			require("./CssColorFunctional.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.CssColorResolver = factory(
			root.Merkava,
			root.Merkava,
			root.Merkava
		).CssColorResolver;
	}
})(typeof self !== "undefined" ? self : this, function(leftMod, rightMod, functionalMod) {
	const namedColors = Object.freeze({
		...leftMod.CssNamedColorsAtoL,
		...rightMod.CssNamedColorsMtoZ
	});

	/**
	 * Resolves standard named colors, hex notation, functional colors,
	 * transparent, and currentColor into stable internal sRGB paint tokens.
	 * Browser-facing CSSOM serialization is deliberately handled elsewhere.
	 */
	class CssColorResolver {
		/**
		 * @param {string} value CSS color token from the cascade.
		 * @param {string} current Resolved inherited color for currentColor.
		 * @returns {string} Internal color token or untouched unsupported syntax.
		 */
		normalize(value, current = "#000000") {
			const text = String(value || "").trim().toLowerCase();
			if (!text) {
				return "";
			}
			if (text === "currentcolor") {
				return this.normalize(current);
			}
			if (text === "transparent") {
				return "rgba(0,0,0,0)";
			}
			if (namedColors[text]) {
				return namedColors[text];
			}
			if (/^#[0-9a-f]{8}$/i.test(text)) {
				return rgbaFromHex8(text);
			}
			if (/^#[0-9a-f]{6}$/i.test(text)) {
				return text;
			}
			if (/^#[0-9a-f]{4}$/i.test(text)) {
				return rgbaFromHex8(expandHex(text));
			}
			if (/^#[0-9a-f]{3}$/i.test(text)) {
				return expandHex(text);
			}
			return functionalMod.resolveFunctionalColor(text) || String(value);
		}
	}

	/** Converts #rrggbbaa into the shared functional/internal representation. */
	function rgbaFromHex8(text) {
		const red = parseInt(text.slice(1, 3), 16);
		const green = parseInt(text.slice(3, 5), 16);
		const blue = parseInt(text.slice(5, 7), 16);
		const opacity = +(parseInt(text.slice(7, 9), 16) / 255).toFixed(3);
		return functionalMod.serializeInternal(red, green, blue, opacity);
	}

	/** Expands short hexadecimal notation without changing case-insensitive value. */
	function expandHex(text) {
		return "#" + text.slice(1).split("").map(value => value + value).join("");
	}

	return {
		CssColorResolver
	};
});
