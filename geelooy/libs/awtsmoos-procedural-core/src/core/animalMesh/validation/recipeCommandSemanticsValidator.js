// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

const GUIDE_OPERATIONS = new Set([
	"loft_elliptical_sections",
	"loft_profile_sections"
]);

export function validateCommandSemantics(recipe, result) {
	const references = new Set(
		(recipe.references || []).map((reference) => reference.reference_id)
	);
	const commandIndexById = new Map(
		(recipe.commands || []).map((command) => [
			command.id,
			command.index
		])
	);

	(recipe.commands || []).forEach((command, index) => {
		const path = `/commands/${index}`;
		for (const sourceId of command.source_basis || []) {
			if (!references.has(sourceId)) {
				result.addError(
					`${path}/source_basis`,
					"source_reference",
					`Unknown reference id: ${sourceId}`
				);
			}
		}
		for (const dependencyId of command.depends_on || []) {
			if ((commandIndexById.get(dependencyId) || Infinity) >= command.index) {
				result.addError(
					`${path}/depends_on`,
					"dependency_order",
					"Dependencies must appear before the command."
				);
			}
		}
		if (
			GUIDE_OPERATIONS.has(command.op) &&
			!recipe.anatomical_guides?.[command.args?.guide]
		) {
			result.addError(
				`${path}/args/guide`,
				"guide_reference",
				"Loft command must reference an existing guide."
			);
		}
		if (command.op === "mirror_geometry" && !command.args?.source) {
			result.addError(
				`${path}/args/source`,
				"mirror_source",
				"Mirror operation requires a source part."
			);
		}
		if (
			command.op === "join_meshes" &&
			(!Array.isArray(command.args?.sources) || command.args.sources.length < 1)
		) {
			result.addError(
				`${path}/args/sources`,
				"join_sources",
				"Join operation requires source part ids."
			);
		}
	});
}
