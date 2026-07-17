// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	proceduralObjectRecipeValidator
} from "../../core/proceduralObject/validation/ProceduralObjectRecipeValidator.js";

/**
 * Produces a safe Blender worker plan without generating executable source.
 *
 * Blender remains one trusted realization vessel among many. Recipes describe
 * intent and data; a maintained worker owns bpy calls, modifiers, simulations,
 * baking, and export implementation.
 *
 * @param {object} recipe Generic procedural recipe.
 * @param {object|null} artifact Optional compiled core artifact.
 * @returns {object} Frozen structured worker plan.
 */
export function createBlenderObjectExecutionPlan(recipe, artifact = null) {
	proceduralObjectRecipeValidator.assertValid(recipe);
	return Object.freeze({
		schema: "awtsmoos.blender-procedural-object-plan",
		schema_version: recipe.schema_version,
		recipe_id: recipe.recipe_id,
		coordinate_system: cloneValue(recipe.coordinate_system),
		definitions: cloneValue(recipe.definitions),
		data_blocks: cloneValue(recipe.data_blocks),
		links: cloneValue(recipe.links),
		materials: cloneValue(recipe.materials),
		objects: cloneValue(recipe.objects),
		commands: recipe.commands.map(createWorkerCommand),
		outputs: cloneValue(recipe.outputs),
		artifact_summary: createArtifactSummary(artifact),
		worker_policy: Object.freeze({
			factory_startup: true,
			isolated_temporary_directory: true,
			network_access: false,
			arbitrary_source_execution: false,
			model_generated_source_execution: false,
			checkpoint_after_each_command: true,
			structured_result_required: true
		})
	});
}

function createWorkerCommand(command) {
	return Object.freeze({
		index: command.index,
		id: command.id,
		op: command.op,
		target: command.target,
		depends_on: Object.freeze([...(command.depends_on || [])]),
		args: cloneValue(command.args || {}),
		executor: command.executor || "blender"
	});
}

function createArtifactSummary(artifact) {
	if (!artifact) {
		return null;
	}
	return Object.freeze({
		geometry_count: Object.keys(artifact.geometries || {}).length,
		object_count: Object.keys(artifact.objects || {}).length,
		material_count: Object.keys(artifact.materials || {}).length,
		deferred_operation_count: artifact.deferredCommands?.length || 0
	});
}

function cloneValue(value) {
	return value == null ? value : JSON.parse(JSON.stringify(value));
}
