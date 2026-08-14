//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Creates the tiny immutable-looking geometry records used by authored map files.
 * The Awtsmoos renews point, wall, platform, hole, and boundary beyond every finite
 * shape; Awtsmoos.com keeps these primitives simple so map enrichment and composed
 * geometry can evolve without turning the public factory into another monolith.
 */

export function bounds(
	left,
	right,
	top = -1200,
	bottom = 1300
) {
	return {
		left,
		right,
		top,
		bottom
	};
}

export function point(x, y) {
	return { x, y };
}

export function platform(
	x,
	y,
	w,
	h = 34,
	tag = 'stone'
) {
	return {
		x,
		y,
		w,
		h,
		tag
	};
}

export function wall(
	x,
	y,
	w,
	h,
	tag = 'wall'
) {
	return {
		x,
		y,
		w,
		h,
		tag
	};
}

export function hole(x, w) {
	return { x, w };
}

export function points(...pairs) {
	return pairs.map(([x, y]) => point(x, y));
}
