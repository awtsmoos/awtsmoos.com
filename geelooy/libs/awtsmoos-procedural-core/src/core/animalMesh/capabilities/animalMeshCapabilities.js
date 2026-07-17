// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	listAnimalArchetypes
} from "../archetypes/AnimalArchetypeRegistry.js";
import {
	createDefaultAnimalMeshOperationRegistry
} from "../compiler/createDefaultOperationRegistry.js";
import {
	ANIMAL_MESH_SCHEMA_VERSION,
	CORE_EXECUTABLE_OPERATIONS
} from "../constants/animalMeshContract.js";

export function getAnimalMeshCapabilities() {
	const registry = createDefaultAnimalMeshOperationRegistry();
	return {
		schema_versions: [ANIMAL_MESH_SCHEMA_VERSION],
		archetypes: listAnimalArchetypes().map((archetype) => archetype.id),
		core_executable_operations: [...CORE_EXECUTABLE_OPERATIONS],
		operations: registry.list().map((definition) => ({
			op: definition.operation,
			executor: definition.executor,
			core_handler_available: Boolean(definition.handler)
		})),
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
