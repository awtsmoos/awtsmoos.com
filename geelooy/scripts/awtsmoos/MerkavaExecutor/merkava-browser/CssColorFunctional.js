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
	/**
	 * Resolves supported CSS rgb(a) and hsl(a) functional colors into the stable
	 * internal sRGB representation used by the paint engine. Modern whitespace,
	 * slash-alpha, percentages, turns, grads, radians, and degrees are accepted.
	 * @param {string} text Lower-cased CSS color token.
	 * @returns {string|null} Internal color or null when syntax is not functional.
	 */
	function resolveFunctionalColor(text) {
		const rgb = String(text || "").match(/^rgba?\(([^)]+)\)$/);
		if (rgb) {
			return rgbColor(rgb[1]);
		}
		const hsl = String(text || "").match(/^hsla?\(([^)]+)\)$/);
		return hsl ? hslColor(hsl[1]) : null;
	}

	/** @returns {string} */
	function rgbColor(body) {
		const parts = splitChannels(body);
		const [red, green, blue] = parts.slice(0, 3).map(channel);
		return serializeInternal(red, green, blue, parts[3]);
	}

	/** @returns {string} */
	function hslColor(body) {
		const parts = splitChannels(body);
		const hue = hueDegrees(parts[0]);
		const saturation = percentage(parts[1]);
		const lightness = percentage(parts[2]);
		const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
		const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
		const offset = lightness - chroma / 2;
		const sector = Math.floor(hue / 60) % 6;
		const vectors = [
			[chroma, x, 0], [x, chroma, 0], [0, chroma, x],
			[0, x, chroma], [x, 0, chroma], [chroma, 0, x]
		];
		const channels = vectors[sector].map(value => Math.round((value + offset) * 255));
		return serializeInternal(...channels, parts[3]);
	}

	/** @returns {number} */
	function hueDegrees(value) {
		const text = String(value || "0").trim();
		const number = Number.parseFloat(text) || 0;
		const degrees = text.endsWith("turn") ? number * 360
			: text.endsWith("grad") ? number * 0.9
			: text.endsWith("rad") ? number * 180 / Math.PI
			: number;
		return ((degrees % 360) + 360) % 360;
	}

	/** @returns {string} */
	function serializeInternal(red, green, blue, alphaToken) {
		const opacity = alphaToken == null ? 1 : alpha(alphaToken);
		const channels = [red, green, blue].map(clamp);
		if (opacity < 1) {
			return `rgba(${channels[0]},${channels[1]},${channels[2]},${opacity})`;
		}
		return "#" + channels.map(value => value.toString(16).padStart(2, "0")).join("");
	}

	function splitChannels(body) { return String(body || "").split(/[,/\s]+/).filter(Boolean); }
	function channel(value) { return clamp(String(value).endsWith("%") ? Number.parseFloat(value) * 2.55 : Number.parseFloat(value)); }
	function percentage(value) { return Math.max(0, Math.min(1, Number.parseFloat(value) / 100)); }
	function alpha(value) { return Math.max(0, Math.min(1, String(value).endsWith("%") ? Number.parseFloat(value) / 100 : Number.parseFloat(value))); }
	function clamp(value) { return Math.max(0, Math.min(255, Math.round(Number.isFinite(value) ? value : 0))); }

	return {
		resolveFunctionalColor,
		serializeInternal
	};
});
