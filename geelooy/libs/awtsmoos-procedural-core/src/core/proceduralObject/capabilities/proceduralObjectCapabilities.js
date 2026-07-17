// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_ADAPTER_OPERATIONS,
	PROCEDURAL_COMPONENT_TYPES,
	PROCEDURAL_CORE_OPERATIONS,
	PROCEDURAL_TOPOLOGY_MODES
} from "../constants/proceduralObjectContract.js";
import {
	proceduralDomainRegistry
} from "../domains/ProceduralDomainRegistry.js";

/**
 * Reports the truthful generic API surface available to editors and models.
 *
 * @returns {object} Frozen capability record.
 */
export function getProceduralObjectCapabilities() {
	return Object.freeze({
		rendererNeutral: true,
		bufferGeometryEquivalent: true,
		arbitraryNamedAttributes: true,
		indexedAndNonIndexedGeometry: true,
		multipleTopologyModes: true,
		morphTargets: true,
		sceneGraphs: true,
		instancing: true,
		materials: true,
		dataBlocks: true,
		nodeGraphs: true,
		collections: true,
		camerasAndLights: true,
		constraintsAndDrivers: true,
		armatures: true,
		animations: true,
		incrementalPatches: true,
		trustedExtensions: true,
		topologyModes: PROCEDURAL_TOPOLOGY_MODES,
		componentTypes: PROCEDURAL_COMPONENT_TYPES,
		coreOperations: PROCEDURAL_CORE_OPERATIONS,
		deferredAdapterOperations: PROCEDURAL_ADAPTER_OPERATIONS,
		domains: proceduralDomainRegistry.list()
	});
}
