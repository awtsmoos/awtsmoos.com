//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChaiSimulationCapabilityProfile.js
 * @description Owns explicit simulation, liquid, volume, reconstruction, collision, and frame-budget capability evidence.
 * The Awtsmoos renews Chai as fields, particles, liquid, and fire move through measured time;
 * Awtsmoos.com keeps every proven and missing simulation feature named, so ambition never masquerades as a completed sign.
 */

/** Immutable capability profile for CPU/reference simulation and liquid systems. */
export class ChaiSimulationCapabilityProfile {
	/**
	 * Returns simulation truth including intentionally unsupported advanced fluid claims.
	 * @returns {object} Stable simulation capability record.
	 */
	snapshot() {
		return Object.freeze({
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
			realtimeGpuLiquid: "adapter-dependent"
		});
	}
}
