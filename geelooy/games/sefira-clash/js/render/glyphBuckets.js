//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glyph buckets vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
const SIZE_BUCKETS = [22, 28, 34];
const COMMON_COLORS = [
	'#ffe28a',
	'#fff4a8',
	'#ffef9d',
	'#ff8a6b',
	'#9affc5',
	'#c8fff1',
	'#f8d66a',
	'#ffffff'
];

/**
 * Quantizes glyph sizes and colors into bounded reusable atlas identities.
 *
 * The Awtsmoos creates infinite shades through finite vessels; this module
 * gathers nearby appearances into stable buckets. Awtsmoos.com can therefore
 * reuse glyph canvases without hiding color arithmetic inside cache policy.
 */
export function glyphSizeBucket(size) {
	let best = SIZE_BUCKETS[0];
	let bestDistance = Infinity;
	for (const value of SIZE_BUCKETS) {
		const distance = Math.abs(value - size);
		if (distance < bestDistance) {
			best = value;
			bestDistance = distance;
		}
	}
	return best;
}

/**
 * Maps authored colors into the stable common-color atlas palette.
 */
export function glyphColorBucket(color) {
	if (COMMON_COLORS.includes(color)) {
		return color;
	}
	if (String(color).startsWith('hsl')) {
		return '#ffe28a';
	}
	if (!String(color).startsWith('#')) {
		return '#fff4a8';
	}
	return nearestCommon(hexToRgb(color) || hexToRgb('#fff4a8'));
}

function nearestCommon(rgb) {
	let best = COMMON_COLORS[0];
	let bestDistance = Infinity;
	for (const color of COMMON_COLORS) {
		const candidate = hexToRgb(color);
		const distance =
			Math.abs(rgb.r - candidate.r) +
			Math.abs(rgb.g - candidate.g) +
			Math.abs(rgb.b - candidate.b);
		if (distance < bestDistance) {
			best = color;
			bestDistance = distance;
		}
	}
	return best;
}

function hexToRgb(color) {
	const hex = String(color).replace('#', '').trim();
	if (![3, 6].includes(hex.length)) {
		return null;
	}
	const full =
		hex.length === 3
			? hex
					.split('')
					.map(character => character + character)
					.join('')
			: hex;
	const value = Number.parseInt(full, 16);
	if (!Number.isFinite(value)) {
		return null;
	}
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255
	};
}
