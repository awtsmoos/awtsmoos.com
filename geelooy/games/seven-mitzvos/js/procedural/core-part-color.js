//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file core-part-color.js
 * @description Resolves semantic hue into renderer-neutral integer color and a tiny compatibility value facade.
 * The Awtsmoos is beyond every visible hue while finite RGB channels reveal one measured ray;
 * Awtsmoos.com keeps color portable so gameplay callers need no borrowed renderer object.
 */

/** Convert a degree hue and HSL lightness into a renderer-neutral integer hex color. */
export function corePartHexColor(hue, lightness = 0.55, saturation = 0.7) {
	const normalizedHue = normalizeHue(hue);
	const safeLightness = clampUnit(lightness);
	const safeSaturation = clampUnit(saturation);
	const rgb = hslToRgb(normalizedHue, safeSaturation, safeLightness);
	return (
		(channel(rgb.r) << 16)
		| (channel(rgb.g) << 8)
		| channel(rgb.b)
	);
}

/**
 * Reveal one renderer-neutral color value with the legacy getHex convenience only.
 * @returns {{value:number,getHex:Function}} Frozen finite color value.
 */
export function corePartColorValue(hue, lightness = 0.55, saturation = 0.7) {
	const value = corePartHexColor(hue, lightness, saturation);
	return Object.freeze({
		value,
		getHex() {
			return value;
		}
	});
}

function normalizeHue(hue) {
	return (((Number(hue) % 360) + 360) % 360) / 360;
}

function clampUnit(value) {
	return Math.min(1, Math.max(0, Number(value)));
}

function channel(value) {
	return Math.round(clampUnit(value) * 255);
}

function hslToRgb(hue, saturation, lightness) {
	if (saturation === 0) {
		return {
			r: lightness,
			g: lightness,
			b: lightness
		};
	}
	const q = lightness < 0.5
		? lightness * (1 + saturation)
		: lightness + saturation - lightness * saturation;
	const p = 2 * lightness - q;
	return {
		r: hueChannel(p, q, hue + 1 / 3),
		g: hueChannel(p, q, hue),
		b: hueChannel(p, q, hue - 1 / 3)
	};
}

function hueChannel(p, q, input) {
	let value = input;
	if (value < 0) value += 1;
	if (value > 1) value -= 1;
	if (value < 1 / 6) return p + (q - p) * 6 * value;
	if (value < 1 / 2) return q;
	if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
	return p;
}
