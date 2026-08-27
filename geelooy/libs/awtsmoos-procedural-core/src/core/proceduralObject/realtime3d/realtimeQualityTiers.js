// B"H
// Boruch Hashem
// Blessed is He
/** Finite quality tiers let the river shed cost before it sheds continuity. */

const TIER_DECLARATIONS = [
	["minimal", 8, 1, 6, 2.5, 32768, 20000],
	["performance", 12, 2, 4, 2, 65536, 40000],
	["balanced", 20, 3, 2, 1.5, 131072, 80000],
	["high", 32, 4, 1, 1.15, 262144, 160000],
	["ultra", 48, 6, 1, 1, 524288, 300000]
];

export const REALTIME_LIQUID_QUALITY_TIERS = Object.freeze(
	TIER_DECLARATIONS.map((declaration, index) => Object.freeze({
		id: declaration[0],
		index,
		pressureIterations: declaration[1],
		maxSubsteps: declaration[2],
		surfaceCadence: declaration[3],
		surfaceCellScale: declaration[4],
		maxSurfaceCells: declaration[5],
		maxTriangles: declaration[6]
	}))
);

export function resolveRealtimeLiquidQualityTier(value = "balanced") {
	if (typeof value === "number" && Number.isFinite(value)) {
		const index = Math.max(0, Math.min(
			REALTIME_LIQUID_QUALITY_TIERS.length - 1,
			Math.floor(value)
		));
		return REALTIME_LIQUID_QUALITY_TIERS[index];
	}
	const tier = REALTIME_LIQUID_QUALITY_TIERS.find(candidate => (
		candidate.id === value
	));
	if (!tier) {
		throw new TypeError(`Unknown realtime liquid quality tier: ${value}`);
	}
	return tier;
}

export function realtimeLiquidQualityIndex(value) {
	return resolveRealtimeLiquidQualityTier(value).index;
}
