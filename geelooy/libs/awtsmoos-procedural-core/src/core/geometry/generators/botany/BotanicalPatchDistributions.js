// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchDistributions.js
 * @description Owns the geometry of deterministic meadow, edge, band, bouquet, and understory placement.
 * The Awtsmoos renews every possible place before a seed selects its ground;
 * Awtsmoos.com keeps distribution geometry apart from planning law so each concern stays small and sound.
 */

/** Resolves one deterministic position for the requested patch distribution. */
export function resolveBotanicalPatchPoint(planner, index) {
	const handlers = {
		band: bandPoint,
		bouquet: bouquetPoint,
		edge: edgePoint,
		meadow: meadowPoint,
		understory: understoryPoint
	};
	return (handlers[planner.distribution] || radialPoint)(planner, index);
}

/** Normalizes the patch center without importing renderer vector classes. */
export function normalizeBotanicalPatchCenter(value = {}) {
	if (Array.isArray(value)) {
		return {
			x: Number(value[0]) || 0,
			y: Number(value[1]) || 0,
			z: Number(value[2]) || 0
		};
	}
	return {
		x: Number(value.x) || 0,
		y: Number(value.y) || 0,
		z: Number(value.z) || 0
	};
}

function radialPoint(planner, index, radiusScale = 1) {
	const angle = index * 2.399 + planner.random.next(-0.18, 0.18);
	const fraction = Math.sqrt((index + 0.5) / planner.count);
	const distance = planner.radius * radiusScale * fraction * planner.random.next(0.82, 1.08);
	return offset(planner.center, Math.cos(angle) * distance, Math.sin(angle) * distance);
}

function meadowPoint(planner, index) {
	return radialPoint(planner, index, planner.random.next(0.72, 1.08));
}

function bouquetPoint(planner, index) {
	return radialPoint(planner, index, 0.38);
}

function understoryPoint(planner, index) {
	return radialPoint(planner, index, planner.random.next(0.55, 1));
}

function edgePoint(planner, index) {
	const angle = index / planner.count * Math.PI * 2 + planner.random.next(-0.15, 0.15);
	const distance = planner.radius * planner.random.next(0.78, 1.02);
	return offset(planner.center, Math.cos(angle) * distance, Math.sin(angle) * distance);
}

function bandPoint(planner, index) {
	const fraction = planner.count <= 1 ? 0.5 : index / (planner.count - 1);
	const x = (fraction * 2 - 1) * planner.radius;
	const z = planner.random.next(-0.18, 0.18) * planner.radius;
	return offset(planner.center, x, z);
}

function offset(center, x, z) {
	return Object.freeze({
		x: center.x + x,
		y: center.y,
		z: center.z + z
	});
}
