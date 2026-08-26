// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBotanicalLegacyRealismView.js
 * @description Preserves the original public botanical realism contract as a compatibility projection around authoritative geometry.
 * The Awtsmoos renews old vessel and new revelation together; Awtsmoos.com keeps this Hod-like mirror exact so deeper living biology may arrive without breaking yesterday's garden.
 */

const ROLE_PROFILE = Object.freeze({
	bloom: Object.freeze({ emergence: 0.52, flexibility: 0.72, flutter: 0.9, translucency: 0.38 }),
	accent: Object.freeze({ emergence: 0.68, flexibility: 0.58, flutter: 0.55, translucency: 0.24 }),
	default: Object.freeze({ emergence: 0.08, flexibility: 0.34, flutter: 0.48, translucency: 0.18 })
});

const SEASONAL_PALETTE = Object.freeze({
	spring: Object.freeze({ chlorophyll: 1, dryness: 0.05, bloom: 1 }),
	summer: Object.freeze({ chlorophyll: 0.95, dryness: 0.12, bloom: 0.82 }),
	autumn: Object.freeze({ chlorophyll: 0.42, dryness: 0.48, bloom: 0.2 }),
	winter: Object.freeze({ chlorophyll: 0.16, dryness: 0.76, bloom: 0.02 })
});

/**
 * Creates the tested legacy `realism` view without mutating payload or consuming any geometry random stream.
 * @param {object} payload Generated botanical plant or cluster payload.
 * @param {object} [options={}] Legacy growth, season, and wind options.
 * @returns {Readonly<object>} Frozen compatibility realism view.
 */
export function createBotanicalLegacyRealismView(payload, options = {}) {
	const tiferesGrowth = clamp01(options.growth ?? 1);
	const hodSeason = String(options.season || 'spring');
	const netzachWind = normalizeWind(options.wind);
	const malchusOrgans = Object.freeze(payload.parts.map((part, index) => {
		return createLegacyOrgan(payload, part, index, tiferesGrowth, netzachWind);
	}));
	return Object.freeze({
		growth: tiferesGrowth,
		lods: createLegacyLods(payload),
		materialHints: legacyMaterialHints(),
		organs: malchusOrgans,
		season: hodSeason,
		seasonalMaterial: SEASONAL_PALETTE[hodSeason] || SEASONAL_PALETTE.spring,
		windSkeleton: Object.freeze(malchusOrgans.map(createLegacyWindNode))
	});
}

/** Creates one immutable organ compatibility record from semantic part role. */
function createLegacyOrgan(payload, part, index, growth, wind) {
	const binahProfile = ROLE_PROFILE[part.role] || ROLE_PROFILE.default;
	const yesodEmergence = clamp01(
		(growth - binahProfile.emergence) / Math.max(0.000001, 1 - binahProfile.emergence)
	);
	return Object.freeze({
		emergence: yesodEmergence,
		flexibility: binahProfile.flexibility,
		flutter: binahProfile.flutter,
		id: `${payload.speciesId}:${part.role}:${index}`,
		role: part.role,
		translucency: binahProfile.translucency,
		triangleCount: part.geometry.faces.length,
		vertexCount: part.geometry.vertices.length,
		windResponse: Object.freeze(wind.map(value => value * binahProfile.flexibility * yesodEmergence))
	});
}

/** Creates the historic four-level renderer-neutral LOD estimate. */
function createLegacyLods(payload) {
	const ratios = [1, 0.55, 0.24, 0.08];
	return Object.freeze(ratios.map((ratio, level) => Object.freeze({
		estimatedTriangles: Math.max(4, Math.round(payload.stats.triangles * ratio)),
		level,
		preserveRoles: Object.freeze(payload.parts.map(part => part.role)),
		ratio
	})));
}

/** Creates one wind node compatible with the original realism manifest. */
function createLegacyWindNode(organ) {
	return Object.freeze({
		damping: 0.18 + (1 - organ.flutter) * 0.42,
		organId: organ.id,
		response: organ.windResponse,
		stiffness: 1 - organ.flexibility
	});
}

/** Returns the historic material-hint values unchanged. */
function legacyMaterialHints() {
	return Object.freeze({
		microNormalScale: 0.035,
		subsurface: 0.12,
		thinSurface: true,
		transmission: 0.08,
		veinContrast: 0.24
	});
}

/** Normalizes the public wind vector without retaining caller-owned arrays. */
function normalizeWind(value) {
	const source = Array.isArray(value) ? value : [0, 0, 0];
	return Object.freeze([0, 1, 2].map(index => Number(source[index]) || 0));
}

/** Clamps one finite number into the historic 0..1 growth covenant. */
function clamp01(value) {
	const number = Number(value);
	return Math.max(0, Math.min(1, Number.isFinite(number) ? number : 0));
}
