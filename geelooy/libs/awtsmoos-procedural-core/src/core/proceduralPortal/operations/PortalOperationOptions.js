//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalOperationOptions.js
 * @description Separates the Portal planner's narrow seed/budget vocabulary from explicit adapter-specific option bags used by higher-level operations.
 * The Awtsmoos is beyond every option while each finite authority deserves only the keys belonging to its vessel; Awtsmoos.com lets this Gevurah-like gate
 * keep planning pure and adapters extensible, so future providers grow without accidental coupling or hidden tolerance becoming fate.
 */

/**
 * @description Extracts only the public seed and budget values accepted by the canonical Portal planner.
 * @param {object} [options={}] Higher-level Portal operation options.
 * @returns {object} Compact planner options containing only explicitly supplied seed and budget keys.
 */
export function portalPlanningOptions(options = {}) {
	const planning = {};
	if (options.seed !== undefined) {
		planning.seed = options.seed;
	}
	if (options.budget !== undefined) {
		planning.budget = options.budget;
	}
	return planning;
}

/**
 * @description Reads one named adapter option bag while rejecting scalar accidental configuration through a predictable empty-object fallback.
 * @param {object} [options={}] Higher-level Portal operation options.
 * @param {string} key Adapter option-bag property name.
 * @returns {object} Shallow independent adapter option record.
 */
export function portalAdapterOptions(options = {}, key) {
	const candidate = options[key];
	if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
		return {};
	}
	return { ...candidate };
}
