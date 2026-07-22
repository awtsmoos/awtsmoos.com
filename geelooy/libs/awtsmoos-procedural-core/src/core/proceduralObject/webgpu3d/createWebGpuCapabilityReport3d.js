// B"H
// Boruch Hashem
// Blessed is He
/** Device evidence distinguishes implemented PIC transfer from every deferred fluid promise. */

function sortedFeatures(value) {
	return Object.freeze([...new Set(value ? [...value].map(String) : [])].sort());
}

export function createWebGpuCapabilityReport3d(input = {}) {
	const features = sortedFeatures(input.features ?? input.device?.features);
	const requiredFeatures = sortedFeatures(input.requiredFeatures ?? []);
	const optionalFeatures = sortedFeatures(input.optionalFeatures ?? ["timestamp-query"]);
	const missingRequiredFeatures = Object.freeze(requiredFeatures.filter(feature => (
		!features.includes(feature)
	)));
	const availableOptionalFeatures = Object.freeze(optionalFeatures.filter(feature => (
		features.includes(feature)
	)));
	const limits = Object.freeze({ ...(input.limits ?? input.device?.limits ?? {}) });
	return Object.freeze({
		schema: "awtsmoos.webgpu-capability-report-3d",
		available: input.available ?? Boolean(input.device),
		compatible: missingRequiredFeatures.length === 0,
		features,
		requiredFeatures,
		optionalFeatures,
		missingRequiredFeatures,
		availableOptionalFeatures,
		limits,
		implemented: Object.freeze({
			particleIntegration: true,
			gridClear: true,
			particleGridDeposition: true,
			globalForces: true,
			gridVelocityNormalization: true,
			picGridToParticleTransfer: true,
			surfacePointPacking: true,
			picFlipDeposition: false,
			macPressureProjection: false,
			marchingCubes: false
		})
	});
}
