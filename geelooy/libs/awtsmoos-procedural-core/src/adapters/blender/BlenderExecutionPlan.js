// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	animalMeshRecipeValidator
} from "../../core/animalMesh/validation/AnimalMeshRecipeValidator.js";

/**
 * Produces data for a trusted Blender worker without producing executable code.
 *
 * @param {Object} recipe Valid animal recipe.
 * @param {Object|null} artifact Optional core compilation artifact.
 * @returns {Object} Safe, deterministic worker plan.
 */
export function createBlenderExecutionPlan(recipe, artifact = null) {
	animalMeshRecipeValidator.assertValid(recipe);
	return {
		schema: "awtsmoos.blender-animal-mesh-plan",
		schema_version: recipe.schema_version,
		recipe_id: recipe.recipe_id,
		coordinate_system: {
			...recipe.coordinate_system
		},
		asset: {
			...recipe.asset
		},
		commands: recipe.commands.map((command) => ({
			index: command.index,
			id: command.id,
			op: command.op,
			target: command.target,
			depends_on: [
				...(command.depends_on || [])
			],
			args: structuredCloneValue(command.args || {})
		})),
		rig: structuredCloneValue(recipe.rig),
		validation: structuredCloneValue(recipe.validation),
		core_artifact_summary: artifact
			? {
				part_count: artifact.parts.length,
				triangle_count: artifact.validationReport?.triangle_count || 0,
				deferred_operation_count: artifact.deferredCommands.length
			}
			: null,
		worker_policy: {
			factory_startup: true,
			isolated_temporary_directory: true,
			network_access: false,
			arbitrary_source_execution: false,
			checkpoint_after_each_command: true,
			structured_result_required: true
		}
	};
}

function structuredCloneValue(value) {
	return JSON.parse(JSON.stringify(value));
}
