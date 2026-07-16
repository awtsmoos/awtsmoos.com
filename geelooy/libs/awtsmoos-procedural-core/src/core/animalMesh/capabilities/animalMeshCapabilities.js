// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_SCHEMA_VERSION,
	CORE_EXECUTABLE_OPERATIONS
} from "../constants/animalMeshContract.js";
import {
	createDefaultAnimalMeshOperationRegistry
} from "../compiler/createDefaultOperationRegistry.js";
import {
	listAnimalArchetypes
} from "../archetypes/AnimalArchetypeRegistry.js";

export function getAnimalMeshCapabilities() {
	const registry = createDefaultAnimalMeshOperationRegistry();
	return {
		schema_versions: [
			ANIMAL_MESH_SCHEMA_VERSION
		],
		archetypes: listAnimalArchetypes().map((archetype) => archetype.id),
		core_executable_operations: [
			...CORE_EXECUTABLE_OPERATIONS
		],
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
			core_render_data: true,
			three_group: true,
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
