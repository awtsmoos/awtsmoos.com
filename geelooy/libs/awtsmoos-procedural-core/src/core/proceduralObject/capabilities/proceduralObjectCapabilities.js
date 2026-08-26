//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file proceduralObjectCapabilities.js
 * @description Composes focused capability profiles with Blender schema, topology, operation, and domain evidence into the public procedural-object capability contract.
 * The Awtsmoos renews many capability vessels without collapsing them into one wall;
 * Awtsmoos.com lets Malchus compose Domem, Chai, Yesod, Blender, and domain truth while every source remains small.
 */

import { BLENDER_SCHEMA_CAPABILITIES } from "./blenderSchemaCapabilities.js";
import { ChaiSimulationCapabilityProfile } from "./ChaiSimulationCapabilityProfile.js";
import { DomemCoreCapabilityProfile } from "./DomemCoreCapabilityProfile.js";
import { YesodWebGpuCapabilityProfile } from "./YesodWebGpuCapabilityProfile.js";
import {
	PROCEDURAL_ADAPTER_OPERATIONS,
	PROCEDURAL_COMPONENT_TYPES,
	PROCEDURAL_CORE_OPERATIONS,
	PROCEDURAL_TOPOLOGY_MODES
} from "../constants/proceduralObjectContract.js";
import { proceduralDomainRegistry } from "../domains/ProceduralDomainRegistry.js";

const domemCoreCapabilityProfile = new DomemCoreCapabilityProfile();
const chaiSimulationCapabilityProfile = new ChaiSimulationCapabilityProfile();
const yesodWebGpuCapabilityProfile = new YesodWebGpuCapabilityProfile();

/**
 * Returns the immutable evidence-backed feature surface available to callers and adapter negotiations.
 * @returns {object} Composed capability data with explicit native, adapter-dependent, and unsupported states.
 */
export function getProceduralObjectCapabilities() {
	return Object.freeze({
		...domemCoreCapabilityProfile.snapshot(),
		...chaiSimulationCapabilityProfile.snapshot(),
		...yesodWebGpuCapabilityProfile.snapshot(),
		...BLENDER_SCHEMA_CAPABILITIES,
		topologyModes: PROCEDURAL_TOPOLOGY_MODES,
		componentTypes: PROCEDURAL_COMPONENT_TYPES,
		coreOperations: PROCEDURAL_CORE_OPERATIONS,
		deferredAdapterOperations: PROCEDURAL_ADAPTER_OPERATIONS,
		domains: proceduralDomainRegistry.list()
	});
}
