// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function estimateAnimalMeshTriangles(recipe) {
	let estimatedTriangles = 0;

	for (const command of recipe.commands || []) {
		if ([
			"loft_elliptical_sections",
			"loft_profile_sections"
		].includes(command.op)) {
			const guide = recipe.anatomical_guides?.[command.args?.guide];
			if (guide) {
				const radial = command.args?.radial_segments
					|| guide.radial_segments
					|| 16;
				const longitudinal = command.args?.longitudinal_segments
					|| guide.longitudinal_segments
					|| 12;
				estimatedTriangles += radial * longitudinal * 2;
				if (command.args?.cap_start === true) {
					estimatedTriangles += radial;
				}
				if (command.args?.cap_end === true) {
					estimatedTriangles += radial;
				}
			}
		}
		if (command.op === "mirror_geometry") {
			const sourceCommand = recipe.commands.find((candidate) => {
				return candidate.target === command.args?.source;
			});
			if (sourceCommand) {
				estimatedTriangles += estimateCommandTriangles(recipe, sourceCommand);
			}
		}
	}
	return estimatedTriangles;
}

export function createAnimalLodPlan(asset, ratios = [
	1,
	0.5,
	0.25
]) {
	const target = asset.target_triangle_count;
	return ratios.map((ratio, index) => ({
		id: `lod_${index}`,
		ratio,
		target_triangle_count: Math.max(64, Math.round(target * ratio)),
		screen_coverage: index === 0
			? 1
			: Math.max(0.02, 0.5 ** index)
	}));
}

function estimateCommandTriangles(recipe, command) {
	const guide = recipe.anatomical_guides?.[command.args?.guide];
	if (!guide) {
		return 0;
	}
	const radial = guide.radial_segments || 16;
	const longitudinal = guide.longitudinal_segments || 12;
	return radial * longitudinal * 2;
}
