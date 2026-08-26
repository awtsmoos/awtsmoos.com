//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DomemCoreCapabilityProfile.js
 * @description Owns stable renderer-neutral, scene, modifier, data, plugin, and authored-content capability evidence.
 * The Awtsmoos renews the quiet Domem beneath every higher runtime claim;
 * Awtsmoos.com keeps foundational capability in one readable vessel so future growth never turns one ledger into a tangled frame.
 */

import { BLENDER_MODIFIER_CATALOG } from "../modifiers/blenderModifierCatalog.js";
import { CORE_NATIVE_MODIFIER_IDS } from "../modifiers/builtins/nativeModifierIds.js";

/**
 * Immutable capability profile for stable authored-data and modeling features.
 */
export class DomemCoreCapabilityProfile {
	/**
	 * Creates one immutable evidence snapshot from authoritative modifier catalogs.
	 * @returns {object} Stable core capability record.
	 */
	snapshot() {
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
			pluginManifests: true,
			pluginPermissionPolicy: "default-deny",
			pluginSignatureVerification: "trusted-host-adapter",
			pluginExecution: false,
			trustedExtensions: false,
			adapterCapabilityNegotiation: true,
			modifierCatalog: true,
			modifierCatalogSize: BLENDER_MODIFIER_CATALOG.length,
			modifierStackExecution: true,
			locallyImplementedModifiers: CORE_NATIVE_MODIFIER_IDS,
			fullBlenderModifierParity: false,
			typedFields: true,
			deterministicParticles: true,
			shallowWater2d: true,
			combustion2d: true,
			explosionCoupling: true,
			volumetricFluid: "adapter-dependent",
			nodeSocketAlgebra: true,
			keyframeCurves: true,
			assetGeneration: true,
			universalNodeGraphs: true,
			materialCompilePlans: true
		});
	}
}
