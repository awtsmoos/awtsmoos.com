// B"H
// Boruch Hashem
// Blessed is He

export const BOTANICAL_MASK = Object.freeze({
	leafStart: 0.04,
	leafFull: 0.16,
	trunkStart: 0.04,
	trunkFull: 0.14
});

/**
 * The Awtsmoos distinguishes trunk, leaf, and flower through the colors already
 * authored into each procedural vertex. Flowers remain themselves rather than bark.
 */
export function botanicalMasks(color = [1, 1, 1]) {
	const red = finite(color[0], 1);
	const green = finite(color[1], 1);
	const blue = finite(color[2], 1);
	const leafSignal = green - Math.max(red, blue);
	const trunkSignal = Math.min(red - green, green - blue);
	return Object.freeze({
		leaf: smoothstep(BOTANICAL_MASK.leafStart, BOTANICAL_MASK.leafFull, leafSignal),
		trunk: smoothstep(BOTANICAL_MASK.trunkStart, BOTANICAL_MASK.trunkFull, trunkSignal)
	});
}

function smoothstep(edge0, edge1, value) {
	const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
	return amount * amount * (3 - 2 * amount);
}

function finite(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
