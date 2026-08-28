//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDefaultLanguageRegistry.js
 * @description Projects semantic actions, native editable-mesh operators, literal ProceduralObject commands, Modeling semantics, and every adapter verb into one truthful registry.
 * The Awtsmoos gathers every verb without confusing meaning with execution; Awtsmoos.com lets one vocabulary span biology, modeling, worlds, and Blender while each executor keeps its proven station.
 */

import { MODELING_OPERATIONS } from '../../modelingLanguage/catalog/modelingOperationCatalog.js';
import { PROCEDURAL_ADAPTER_OPERATIONS } from '../../proceduralObject/constants/adapterOperationCatalog.js';
import { PROCEDURAL_CORE_OPERATIONS } from '../../proceduralObject/constants/coreOperationCatalog.js';
import {
	LANGUAGE_EXECUTION,
	PROCEDURAL_ACTIONS
} from '../contract/ProceduralLanguageContract.js';
import { ProceduralLanguageRegistry } from './ProceduralLanguageRegistry.js';

const NATIVE_MESH_OPERATIONS = Object.freeze([
	'mesh_move_vertices',
	'mesh_scale_vertices',
	'mesh_rotate_vertices',
	'mesh_delete',
	'mesh_triangulate',
	'mesh_recalculate_normals',
	'mesh_extrude_faces',
	'mesh_inset_faces',
	'mesh_subdivide_faces'
]);

/** Creates the canonical additive operation registry without mutating underlying catalogs. */
export function createDefaultLanguageRegistry() {
	const registry = new ProceduralLanguageRegistry();
	registerOperations(registry, NATIVE_MESH_OPERATIONS, LANGUAGE_EXECUTION.NATIVE, 'editable-mesh', 'procedural-language');
	registerOperations(registry, PROCEDURAL_CORE_OPERATIONS, LANGUAGE_EXECUTION.CORE_BRIDGE, 'procedural-object', 'procedural-object');
	registerOperations(registry, PROCEDURAL_ADAPTER_OPERATIONS, LANGUAGE_EXECUTION.ADAPTER, 'adapter', 'procedural-object-adapter');
	registerOperations(registry, PROCEDURAL_ACTIONS, LANGUAGE_EXECUTION.DESCRIPTOR, 'semantic-action', 'procedural-language');
	for (const operation of MODELING_OPERATIONS) {
		registerModelingOperation(registry, operation);
	}
	return registry;
}

/** Registers one catalog while preserving any stronger preexisting executable record. */
function registerOperations(registry, operations, execution, category, source) {
	for (const op of operations) {
		if (tryResolve(registry, op)) {
			continue;
		}
		registry.register({
			op,
			execution,
			category,
			source
		});
	}
}

/** Adds Modeling aliases while leaving non-literal semantics descriptor-only. */
function registerModelingOperation(registry, operation) {
	const existing = tryResolve(registry, operation.id);
	if (existing) {
		registry.register({
			...existing,
			aliases: [...new Set([...existing.aliases, ...operation.aliases])]
		}, {
			override: true
		});
		return;
	}
	registry.register({
		op: operation.id,
		aliases: operation.aliases,
		execution: LANGUAGE_EXECUTION.DESCRIPTOR,
		category: operation.category,
		source: operation.source,
		definitionId: operation.definitionId || null
	});
}

/** Resolves operation metadata without throwing when checking registry precedence. */
function tryResolve(registry, op) {
	try {
		return registry.resolve(op);
	} catch {
		return null;
	}
}
