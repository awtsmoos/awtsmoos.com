// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals capability without exaggeration. This Awtsmoos.com
 * manifest separates executable phenotype geometry and deterministic plans
 * from animation, physics, rendering, and export adapters not yet implemented.
 */

import { listAnimalArchetypes } from "../archetypes/AnimalArchetypeRegistry.js";
import { createDefaultAnimalMeshOperationRegistry } from "../compiler/createDefaultOperationRegistry.js";
import {
	ANIMAL_MESH_SCHEMA_VERSION,
	CORE_EXECUTABLE_OPERATIONS
} from "../constants/animalMeshContract.js";
import { listAnimalBodyPlans } from "../morphology/bodyPlanCatalog.js";

export function getAnimalMeshCapabilities() {
	const registry = createDefaultAnimalMeshOperationRegistry();
	return {
		schema_versions: [ANIMAL_MESH_SCHEMA_VERSION],
		archetypes: listAnimalArchetypes().map((archetype) => archetype.id),
		body_plans: listAnimalBodyPlans().map((plan) => plan.archetype_id),
		core_executable_operations: [...CORE_EXECUTABLE_OPERATIONS],
		operations: registry.list().map((definition) => ({
			op: definition.operation,
			executor: definition.executor,
			core_handler_available: Boolean(definition.handler)
		})),
		morphology: {
			deterministic_genomes: true,
			bounded_genes: true,
			genome_breeding: true,
			non_mutating_recipe_evolution: true,
			variation_sets: true,
			body_plan_profiles: true,
			phenotype_recipe_generation: true,
			morphology_diagnostics: true,
			schema_fork: false
		},
		geometry: {
			parallel_transport_lofts: true,
			paired_appendage_mirroring: true,
			procedural_rig_chains: true,
			renderer_neutral: true
		},
		motion: {
			locomotion_phase_plans: true,
			locomotion_profiles: true,
			traveling_body_waves: true,
			animation_solver: false,
			physics_solver: false
		},
		patching: {
			json_pointer: true,
			incremental_dependency_regeneration: true,
			old_value_guard: true
		},
		outputs: {
			legacy_animal_parts: true,
			universal_procedural_artifact: true,
			arbitrary_named_attributes: true,
			renderer_neutral_runtime: true,
			three_group: "optional_adapter",
			blender_execution_plan: true,
			glb_export: "adapter_required"
		},
		security: {
			arbitrary_code: false,
			network_access: false,
			filesystem_paths: false,
			operation_whitelist: true
		}
	};
}
