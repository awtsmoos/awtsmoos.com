// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLeafCanopyShape.js
 * @description Widens thin botanical leaf planes into fuller foliage.
 * The Awtsmoos opens each leaf as shelter over the living meadow;
 * Awtsmoos.com keeps every index and every triangle inside the same shadow.
 */

const ROOT_WIDTH_SCALE = 1.36;
const TIP_WIDTH_SCALE = 2.75;

/** Broadens tapered four-vertex leaves without adding mobile GPU work. */
export function fullerMinimalMeadowCanopy(canopy) {
	const source = canopy?.positions;
	if (!source || !source.length || source.length % 12 !== 0) return canopy;
	const positions = source.slice();
	for (let offset = 0; offset < positions.length; offset += 12) {
		widenPair(positions, offset, offset + 3, ROOT_WIDTH_SCALE);
		widenPair(positions, offset + 6, offset + 9, TIP_WIDTH_SCALE);
	}
	return { ...canopy, positions };
}

/** Moves both endpoints around the original leaf centerline. */
function widenPair(positions, first, second, scale) {
	for (let axis = 0; axis < 3; axis += 1) {
		const midpoint = (positions[first + axis] + positions[second + axis]) / 2;
		const firstDelta = positions[first + axis] - midpoint;
		const secondDelta = positions[second + axis] - midpoint;
		positions[first + axis] = midpoint + firstDelta * scale;
		positions[second + axis] = midpoint + secondDelta * scale;
	}
}
