// B"H
// Boruch Hashem
// Blessed is He
/**
 * Microdetail is a semantic recipe, never a topology prison. The Awtsmoos lets
 * Awtsmoos.com regenerate pores, scales, fur, feathers, wrinkles, and vascular
 * hints after every lawful remesh.
 */
function detailType(role, input) {
	if (input.detailType) return input.detailType;
	if (/wing|bird|feather/.test(role)) return "feather";
	if (/armor|horn|claw|hoof|keratin/.test(role)) return "keratin-ridge";
	if (/fish|fin|swim/.test(role)) return "scale";
	if (/eye|mouth|nose|ear/.test(role)) return "soft-fold";
	return input.coat === "fur" ? "fur" : "skin-pore";
}

/** Compiles renderer-neutral detail distributions from tissue and semantic roles. */
export function compileCreatureMicrodetail(creature, tissueProfile, input = {}) {
	const density = Math.max(0, Number(input.density ?? 1));
	const regions = tissueProfile.regions.map((region, index) => Object.freeze({
		regionId: region.regionId,
		type: detailType(region.role, input),
		density: density * (0.65 + (index % 7) * 0.055),
		scale: Math.max(0.0005, region.tissue.dermisThickness * 0.18),
		directionField: /limb|support|wing|fin/.test(region.role)
			? "follow-anatomical-axis"
			: "follow-principal-curvature",
		mask: Object.freeze({
			type: "semantic-region",
			regionIds: Object.freeze([region.regionId]),
			dorsalBias: Number(input.dorsalBias ?? 0.2),
			landmarkDistance: true
		}),
		animation: Object.freeze({
			followsSkin: true,
			secondaryMotion: region.tissue.stiffness < 0.5,
			windResponse: /fur|feather/.test(detailType(region.role, input))
		})
	}));
	return Object.freeze({
		type: "creature-microdetail-artifact",
		version: "1.0.0",
		sourceBriahId: creature.id,
		sourceBriahHash: creature.contentHash,
		tissueSourceHash: tissueProfile.sourceBriahHash,
		regions: Object.freeze(regions),
		proceduralCoordinates: Object.freeze([
			"body-axis",
			"geodesic-landmark-distance",
			"principal-curvature",
			"triplanar"
		]),
		preservationPolicy: "regenerate-from-semantic-regions"
	});
}
