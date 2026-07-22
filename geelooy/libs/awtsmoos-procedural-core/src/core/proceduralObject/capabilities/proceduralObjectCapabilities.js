// B"H
// Boruch Hashem
// Blessed is He
/** This Awtsmoos.com vessel reports only capability supported by present evidence. */

import {
	PROCEDURAL_ADAPTER_OPERATIONS,
	PROCEDURAL_COMPONENT_TYPES,
	PROCEDURAL_CORE_OPERATIONS,
	PROCEDURAL_TOPOLOGY_MODES
} from "../constants/proceduralObjectContract.js";
import { proceduralDomainRegistry } from "../domains/ProceduralDomainRegistry.js";
import { BLENDER_MODIFIER_CATALOG } from "../modifiers/blenderModifierCatalog.js";
import { CORE_TRANSFORM_MODIFIER_ID } from "../modifiers/builtins/transformModifier.js";
import { CORE_WAVE_MODIFIER_ID } from "../modifiers/builtins/waveModifier.js";

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
		pluginManifests: true,
		pluginPermissionPolicy: "default-deny",
		pluginSignatureVerification: "trusted-host-adapter",
		pluginExecution: false,
		trustedExtensions: false,
		adapterCapabilityNegotiation: true,
		modifierCatalog: true,
		modifierCatalogSize: BLENDER_MODIFIER_CATALOG.length,
		modifierStackExecution: true,
		locallyImplementedModifiers: Object.freeze([
			CORE_TRANSFORM_MODIFIER_ID,
			CORE_WAVE_MODIFIER_ID
		]),
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
		denseVolumes3d: true,
		sparseScalarBricks3d: true,
		signedDistanceFields: true,
		particleSurfaceReconstruction: true,
		marchingCubesSurface: true,
		marchingCubesInteriorTopologyCompleteness: false,
		combustion3dReference: true,
		realtimeGpuVolumes: "adapter-dependent",
		particleGridLiquid3dReference: true,
		picFlipHybridReference: true,
		liveLiquidSurfaceExtraction: true,
		solidSdfColliders3d: true,
		movingSolidLinearVelocity: true,
		liquidSolidOneWayCoupling: true,
		realtimeLiquidFrameBudgetControl: true,
		adaptiveRealtimeLiquidQuality: true,
		croppedLiquidSurfaceReconstruction: true,
		liquidSurfaceCadenceAndCaching: true,
		realtimeLiquidTelemetry: true,
		target60FpsProfile: true,
		guaranteed60Fps: false,
		apicLiquid3d: false,
		macStaggeredGridLiquid: false,
		freeSurfacePressureBoundary: false,
		cutCellPressureBoundary: false,
		twoWayRigidBodyCoupling: false,
		realtimeGpuLiquid: "adapter-dependent",
		universalNodeGraphs: true,
		blenderNodeSchemaPacks: true,
		opaqueBlenderNodePreservation: true,
		materialCompilePlans: true,
		completeBlenderNodeExecution: false,
		topologyModes: PROCEDURAL_TOPOLOGY_MODES,
		componentTypes: PROCEDURAL_COMPONENT_TYPES,
		coreOperations: PROCEDURAL_CORE_OPERATIONS,
		deferredAdapterOperations: PROCEDURAL_ADAPTER_OPERATIONS,
		domains: proceduralDomainRegistry.list()
	});
}
