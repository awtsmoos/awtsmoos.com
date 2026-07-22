// B"H
// Boruch Hashem
// Blessed is He
/** Flowers carry pollination, pollen, nectar, and seed intent beyond visible petals. */

function deterministicFraction(seed, index) {
	let value = (Number(seed) || 1) ^ (index * 2654435761);
	value = Math.imul(value ^ (value >>> 16), 2246822507);
	value = Math.imul(value ^ (value >>> 13), 3266489909);
	return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

/** Creates reproductive organs and a deterministic pollen emission recipe. */
export function createBotanicalReproductiveProfile(plant, options = {}) {
	const bloomParts = plant.parts.filter((part) => ["bloom", "accent"].includes(part.role));
	const flowerTriangles = bloomParts.reduce((sum, part) => sum + part.geometry.faces.length, 0);
	const pollenCount = Math.min(
		Math.max(0, Math.floor(options.pollenCount ?? flowerTriangles * 0.35)),
		Math.max(0, Math.floor(options.maximumPollen ?? 20000))
	);
	const pollen = Object.freeze(Array.from({ length: pollenCount }, (_, index) => Object.freeze({
		id: `${plant.speciesId}:pollen:${index}`,
		angle: deterministicFraction(plant.seed, index) * Math.PI * 2,
		radius: 0.000012 + deterministicFraction(plant.seed + 7, index) * 0.000018,
		buoyancy: 0.72 + deterministicFraction(plant.seed + 13, index) * 0.24,
		adhesion: 0.45 + deterministicFraction(plant.seed + 29, index) * 0.5
	})));
	return Object.freeze({
		schema: "awtsmoos.botanical-reproductive-profile",
		sourceSpeciesId: plant.speciesId,
		flowering: bloomParts.length > 0,
		organEvidence: Object.freeze({
			bloomParts: bloomParts.length,
			flowerTriangles,
			stamens: Math.max(0, Math.round(flowerTriangles / 14)),
			pistils: bloomParts.length ? Math.max(1, Math.round(bloomParts.length / 2)) : 0,
			ovules: bloomParts.length ? Math.max(1, Math.round(flowerTriangles / 22)) : 0
		}),
		pollen,
		pollenEmission: Object.freeze({
			rate: Number(options.pollenRate ?? pollenCount * 0.12),
			windCoupling: 0.86,
			turbulence: 0.24,
			collisionMode: "adhesive"
		}),
		pollination: Object.freeze({ nectar: bloomParts.length ? 0.65 : 0, scentRange: bloomParts.length ? 4.5 : 0 }),
		seedDevelopment: Object.freeze({ enabled: bloomParts.length > 0, maturationTimeDays: Number(options.maturationTimeDays ?? 34) })
	});
}
