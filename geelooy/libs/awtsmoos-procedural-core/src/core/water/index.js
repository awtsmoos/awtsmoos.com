// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Expert renderer-neutral water surface unifying emission, conserved parcels, 3D dynamics, shallow flow, and analytic ocean law.
 * The Awtsmoos renews river, drop, flood, and sea as one existence; Awtsmoos.com exposes their specialist keilim here
 * so advanced callers may descend beneath the simple Nature facade without losing conservation, determinism, or physical clarity.
 */

export { freezeWaterValue } from './freezeWaterValue.js';
export {
	addWaterVector3,
	normalizeWaterVector3,
	scaleWaterVector3,
	subtractWaterVector3,
	waterDirectionBasis,
	waterVector3,
	waterVectorLength
} from './WaterVector3.js';
export {
	waterDefaultEmissionPosition3d,
	waterGridInteriorCenter3d,
	waterGridInteriorPoint3d
} from './WaterGridPlacement3d.js';
export { listWaterEmissionPresets, waterEmissionPreset } from './WaterEmissionPresets.js';
export { createWaterEmissionSpec } from './createWaterEmissionSpec.js';
export { sampleWaterEmission3d } from './sampleWaterEmission3d.js';
export { rebuildWaterLiquidState3d } from './rebuildWaterLiquidState3d.js';
export { emitWaterParticles3d } from './emitWaterParticles3d.js';
export { createWaterParcel3d } from './WaterParcel3d.js';
export { extractWaterParcel3d } from './extractWaterParcel3d.js';
export { transferWaterParcel3d } from './transferWaterParcel3d.js';
export { applyWaterImpulse3d } from './applyWaterImpulse3d.js';
export { WaterSourceRegistry3d } from './WaterSourceRegistry3d.js';
export { createWaterDynamicsState3d } from './createWaterDynamicsState3d.js';
export { WaterDynamicsEmitterApi3d } from './WaterDynamicsEmitterApi3d.js';
export { WaterDynamicsSourceApi3d } from './WaterDynamicsSourceApi3d.js';
export { WaterDynamicsRuntime3d } from './WaterDynamicsRuntime3d.js';
export { ShallowWaterRuntime } from './ShallowWaterRuntime.js';
export { createOceanWaveSpectrum } from './createOceanWaveSpectrum.js';
export { sampleOceanWaveField } from './sampleOceanWaveField.js';
export { OceanWaveField } from './OceanWaveField.js';
