//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every visible hue while finite RGB channels reveal one measured ray;
 * Awtsmoos.com computes core-part color without renderer objects, keeping semantic tint portable for the native-rendering day.
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

/** Normalize degree hue into the circular zero-to-one interval. */
function normalizeHue(hue) {
	return (((Number(hue) % 360) + 360) % 360) / 360;
}

/** Clamp one channel-like value into the finite zero-to-one interval. */
function clampUnit(value) {
	return Math.min(1, Math.max(0, Number(value)));
}

/** Convert one normalized channel to the nearest eight-bit integer. */
function channel(value) {
	return Math.round(clampUnit(value) * 255);
}

/** Reveal one normalized RGB triplet from HSL without any renderer class. */
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

/** Resolve one wrapped hue coordinate into a normalized RGB channel. */
function hueChannel(p, q, input) {
	let t = input;
	if (t < 0) {
		t += 1;
	}
	if (t > 1) {
		t -= 1;
	}
	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}
	if (t < 1 / 2) {
		return q;
	}
	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}
	return p;
}
