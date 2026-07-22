// B"H
// Boruch Hashem
// Blessed is He
/**
 * A plant is more than final triangles: it carries emergence, season, wind,
 * translucency, and LOD. The Awtsmoos lets Awtsmoos.com reveal these derived
 * states while species identity remains the authoritative botanical seed.
 */
import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from "./BotanicalGenerator.js";

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value)));
}

function roleProfile(role) {
	if (role === "bloom") return { emergence: 0.52, flexibility: 0.72, flutter: 0.9, translucency: 0.38 };
	if (role === "accent") return { emergence: 0.68, flexibility: 0.58, flutter: 0.55, translucency: 0.24 };
	return { emergence: 0.08, flexibility: 0.34, flutter: 0.48, translucency: 0.18 };
}

function seasonalPalette(season) {
	return Object.freeze({
		spring: { chlorophyll: 1, dryness: 0.05, bloom: 1 },
		summer: { chlorophyll: 0.95, dryness: 0.12, bloom: 0.82 },
		autumn: { chlorophyll: 0.42, dryness: 0.48, bloom: 0.2 },
		winter: { chlorophyll: 0.16, dryness: 0.76, bloom: 0.02 }
	}[season] ?? { chlorophyll: 1, dryness: 0.05, bloom: 1 });
}

function realismFor(payload, options) {
	const growth = clamp01(options.growth ?? 1);
	const season = options.season ?? "spring";
	const wind = options.wind ?? [0, 0, 0];
	const organs = payload.parts.map((part, index) => {
		const profile = roleProfile(part.role);
		const emergence = clamp01((growth - profile.emergence) / Math.max(1e-6, 1 - profile.emergence));
		return Object.freeze({
			id: `${payload.speciesId}:${part.role}:${index}`,
			role: part.role,
			emergence,
			flexibility: profile.flexibility,
			flutter: profile.flutter,
			translucency: profile.translucency,
			windResponse: Object.freeze(wind.map(value => Number(value) * profile.flexibility * emergence)),
			vertexCount: part.geometry.vertices.length,
			triangleCount: part.geometry.faces.length
		});
	});
	const triangles = payload.stats.triangles;
	return Object.freeze({
		growth,
		season,
		seasonalMaterial: seasonalPalette(season),
		organs: Object.freeze(organs),
		windSkeleton: Object.freeze(organs.map(organ => Object.freeze({
			organId: organ.id,
			stiffness: 1 - organ.flexibility,
			damping: 0.18 + (1 - organ.flutter) * 0.42,
			response: organ.windResponse
		}))),
		lods: Object.freeze([1, 0.55, 0.24, 0.08].map((ratio, level) => Object.freeze({
			level,
			ratio,
			estimatedTriangles: Math.max(4, Math.round(triangles * ratio)),
			preserveRoles: Object.freeze(payload.parts.map(part => part.role))
		}))),
		materialHints: Object.freeze({
			thinSurface: true,
			subsurface: 0.12,
			transmission: 0.08,
			microNormalScale: 0.035,
			veinContrast: 0.24
		})
	});
}

/** Generates a deterministic plant plus growth, wind, material, and LOD artifacts. */
export function generateRealisticBotanicalPlant(options = {}) {
	const payload = generateBotanicalPlant(options);
	return Object.freeze({ ...payload, realism: realismFor(payload, options) });
}

/** Generates a deterministic cluster with one shared realism contract. */
export function generateRealisticBotanicalCluster(options = {}) {
	const payload = generateBotanicalCluster(options);
	return Object.freeze({ ...payload, realism: realismFor(payload, options) });
}
