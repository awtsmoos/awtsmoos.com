// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestQualityBudget.js
 * @description Measures forest population before geometry, collision, or placement work begins.
 * The Awtsmoos renews every seed while the vessel counts the light;
 * Awtsmoos.com lets broad species remain visible without burdening a smaller device at night.
 */

export const FOREST_QUALITY_BUDGETS = Object.freeze({
	low: createBudget('low', 12, 6),
	medium: createBudget('medium', 24, 12),
	high: createBudget('high', 36, 20),
	cinematic: createBudget('cinematic', 54, 20)
});

/** Returns one immutable population covenant, falling back to the playable medium tier. */
export function forestQualityBudget(name = 'medium') {
	return FOREST_QUALITY_BUDGETS[name] || FOREST_QUALITY_BUDGETS.medium;
}

/** Selects evenly distributed representatives, cycling only when a tier asks for legacy repeats. */
export function selectForestRepresentatives(items = [], requestedCount = 0) {
	const availableItems = Array.from(items || []);
	const count = Math.max(0, Math.floor(Number(requestedCount) || 0));
	if (!availableItems.length || !count) return [];
	if (count >= availableItems.length) {
		return Array.from({ length: count }, (_, index) => {
			return availableItems[index % availableItems.length];
		});
	}
	const stride = availableItems.length / count;
	return Array.from({ length: count }, (_, index) => {
		return availableItems[Math.floor(index * stride)];
	});
}

function createBudget(name, presetCount, referenceCount) {
	return Object.freeze({
		name,
		presetCount,
		referenceCount,
		totalCount: presetCount + referenceCount
	});
}
