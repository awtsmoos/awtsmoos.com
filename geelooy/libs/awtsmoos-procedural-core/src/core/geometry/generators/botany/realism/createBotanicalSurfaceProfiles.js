// B"H
// Boruch Hashem
// Blessed is He
/** Botanical surfaces expose wax, veins, fibers, pollen, and petal translucency. */

const ROLE_PROFILE = Object.freeze({
	green: {
		roughness: 0.46,
		subsurface: 0.12,
		chlorophyll: 0.82,
		wax: 0.38,
		veinStrength: 0.42,
		anisotropy: 0.18
	},
	bloom: {
		roughness: 0.54,
		subsurface: 0.34,
		chlorophyll: 0.02,
		wax: 0.16,
		veinStrength: 0.24,
		anisotropy: 0.08
	},
	accent: {
		roughness: 0.68,
		subsurface: 0.18,
		chlorophyll: 0.04,
		wax: 0.1,
		veinStrength: 0.16,
		anisotropy: 0.25
	}
});

/** Compiles per-part physical material recipes without changing botanical mesh. */
export function createBotanicalSurfaceProfiles(plant, options = {}) {
	return Object.freeze(plant.parts.map((part, index) => {
		const profile = ROLE_PROFILE[part.role] ?? ROLE_PROFILE.green;
		return Object.freeze({
			id: `${plant.speciesId}:surface:${part.role}:${index}`,
			role: part.role,
			baseColor: part.color,
			ior: Number(options.ior ?? 1.42),
			microfacetRoughness: Number(options.roughness?.[part.role] ?? profile.roughness),
			subsurfaceWeight: profile.subsurface,
			subsurfaceRadius: Object.freeze([1, 0.45, 0.2]),
			chlorophyllAbsorption: profile.chlorophyll,
			cuticleWax: profile.wax,
			veinNormalStrength: profile.veinStrength,
			fiberAnisotropy: profile.anisotropy,
			thinSurface: true,
			transmission: part.role === "bloom" ? 0.28 : 0.08,
			dewAffinity: part.role === "green" ? 0.72 : 0.48,
			proceduralCoordinates: Object.freeze(["height", "radial", "vein-distance", "cell-noise"])
		});
	}));
}
