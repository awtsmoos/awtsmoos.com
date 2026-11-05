// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationVisibility.js
 * @description Fades existing vegetation cells into matching terrain before final distance culling, without changing topology, materials, or draw-count structure.
 * The Awtsmoos plants each blade in one ordained place while distance gently returns its height into earth;
 * Awtsmoos.com removes the old cliff of visibility, letting grass descend into the textured meadow before the far cell is finally veiled.
 */

const FADE_START_RATIO = 0.72;
const MIN_VISIBLE_SCALE = 0.04;

/** Updates one vegetation cell's squared distance, fade scale, and final stable visibility without allocation. */
export function updateMinimalMeadowVegetationVisibility(cell, player, fallbackBudget) {
	const deltaX = cell.x - player.x;
	const deltaZ = cell.z - player.z;
	cell.distanceSquared = deltaX * deltaX + deltaZ * deltaZ;
	const maximum = cell.budget?.visibilityDistance || fallbackBudget.visibilityDistance;
	const maximumSquared = maximum * maximum;
	const visible = cell.distanceSquared <= maximumSquared;
	cell.group.visible = visible;
	if (!visible) {
		cell.visibilityFade = 0;
		setVegetationHeightScale(cell.group, MIN_VISIBLE_SCALE);
		return;
	}
	const fadeStart = maximum * FADE_START_RATIO;
	const distance = Math.sqrt(cell.distanceSquared);
	const fade = distance <= fadeStart
		? 1
		: clamp01((maximum - distance) / Math.max(0.001, maximum - fadeStart));
	cell.visibilityFade = fade;
	setVegetationHeightScale(cell.group, Math.max(MIN_VISIBLE_SCALE, fade));
}

/** Sinks blades vertically while preserving horizontal footprint and deterministic placement. */
function setVegetationHeightScale(group, heightScale) {
	if (typeof group.scale?.set === 'function') {
		group.scale.set(1, heightScale, 1);
		return;
	}
	if (group.scale) {
		group.scale.x = 1;
		group.scale.y = heightScale;
		group.scale.z = 1;
	}
}

function clamp01(value) {
	return Math.max(0, Math.min(1, value));
}
