// B"H

/**
 * Selects a distance LOD without trembling at its thresholds. Levels must be
 * ordered from most detailed to least detailed by increasing maximum distance.
 */
export function selectLodLevel({
	distance,
	levels,
	currentIndex = 0,
	hysteresis = 0.12
}) {
	const safeLevels = normalizeLevels(levels);
	if (!safeLevels.length) return 0;
	const safeDistance = Number.isFinite(distance)
		? Math.max(0, distance)
		: Infinity;
	const current = clampIndex(currentIndex, safeLevels.length);
	const desired = idealLevelIndex(safeDistance, safeLevels);
	if (desired === current) return current;
	const margin = Math.max(0, Math.min(0.49, hysteresis));
	if (desired > current) {
		const exitDistance = safeLevels[current].maximumDistance * (1 + margin);
		return safeDistance > exitDistance ? desired : current;
	}
	const enterDistance = safeLevels[desired].maximumDistance * (1 - margin);
	return safeDistance < enterDistance ? desired : current;
}

export function idealLevelIndex(distance, levels) {
	for (let index = 0; index < levels.length; index += 1) {
		if (distance <= levels[index].maximumDistance) return index;
	}
	return levels.length - 1;
}

function normalizeLevels(levels) {
	if (!Array.isArray(levels)) return [];
	return levels.map((level, index) => ({
		...level,
		maximumDistance: finiteDistance(level?.maximumDistance, index, levels.length)
	}));
}

function finiteDistance(value, index, length) {
	if (value === Infinity) return Infinity;
	if (Number.isFinite(value) && value >= 0) return value;
	return index === length - 1 ? Infinity : 0;
}

function clampIndex(index, length) {
	const safeIndex = Number.isFinite(index) ? index | 0 : 0;
	return Math.max(0, Math.min(length - 1, safeIndex));
}
