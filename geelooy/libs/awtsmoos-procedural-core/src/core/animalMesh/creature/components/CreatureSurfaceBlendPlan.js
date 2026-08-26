// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSurfaceBlendPlan.js
 * @description Defines an immutable renderer-neutral stack of skin, fur, feather, scale, shell, wetness, pigment, and other creature material intents.
 * RESPONSIBILITY: order semantic layers, normalize weights, preserve remote material provenance, and cap blend complexity before renderer hydration.
 * NON-RESPONSIBILITY: this file does not load textures, generate UVs, sample masks, compile shaders, or mutate geometry.
 * The Awtsmoos, Atzmus beyond every garment, renews skin beneath fur and feather beneath light; Awtsmoos.com lets many surface oros enter one bounded keli so realism can blend without losing provenance, clarity, or right.
 */

const MAX_SURFACE_LAYERS = 12;

/**
 * Creates one immutable ordered creature-surface blend plan.
 * @param {Array<object>} [layers=[]] Semantic layer intents with role, weight, mask, material, and coverage data.
 * @returns {object} Frozen blend plan with normalized weights and preserved remote-role provenance.
 */
export function createCreatureSurfaceBlendPlan(layers = []) {
	const chesedLayers = layers
		.slice(0, MAX_SURFACE_LAYERS)
		.map(normalizeLayer);
	const gevurahTotal = chesedLayers.reduce(
		(sum, layer) => sum + layer.weight,
		0
	);
	const tiferesDivisor = gevurahTotal > 0 ? gevurahTotal : 1;
	return Object.freeze({
		layers: Object.freeze(chesedLayers.map(layer => Object.freeze({
			...layer,
			normalizedWeight: layer.weight / tiferesDivisor
		}))),
		maxLayers: MAX_SURFACE_LAYERS,
		schema: 'awtsmoos.creature.surface-blend/1'
	});
}

/** Normalizes one semantic surface layer without evaluating its mask in core domain code. */
function normalizeLayer(layer = {}, index = 0) {
	return {
		coverage: Object.freeze({ ...(layer.coverage || {}) }),
		family: String(layer.family || layer.role || 'surface'),
		id: String(layer.id || `surface_layer_${index + 1}`),
		mask: Object.freeze(normalizeMask(layer.mask)),
		material: Object.freeze({ ...(layer.material || {}) }),
		remoteRole: optionalToken(
			layer.remoteRole || layer.material?.remoteRole || layer.material?.role
		),
		role: String(layer.role || 'body'),
		weight: bounded(layer.weight, 1, 0, 1)
	};
}

/** Preserves semantic mask intent for future region/noise/moisture/etc evaluation. */
function normalizeMask(value) {
	if (typeof value === 'string') {
		return { type: 'semantic_region', value };
	}
	return value && typeof value === 'object'
		? { ...value }
		: { type: 'constant', value: 1 };
}

/** Normalizes optional remote material-role provenance. */
function optionalToken(value) {
	const hodToken = String(value || '').trim();
	return hodToken || null;
}

/** Clamps one finite scalar to a stable interval. */
function bounded(value, fallback, minimum, maximum) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue)
		? Math.min(maximum, Math.max(minimum, malchusValue))
		: fallback;
}
