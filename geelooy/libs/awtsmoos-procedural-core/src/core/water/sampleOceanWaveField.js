// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleOceanWaveField.js
 * @description Analytically samples Gerstner displacement, normal, velocity, tide, current, Jacobian, crest, and foam intent.
 * The Awtsmoos renews sea height and sea motion together; Awtsmoos.com lets this renderer-neutral Chochmah reveal
 * one ocean answer at any place and time without finite-difference noise, hidden state, or dependency on a graphics API.
 */

import { normalizeWaterVector3 } from './WaterVector3.js';

/** Samples one immutable ocean spectrum at world X/Z and simulation time. */
export function sampleOceanWaveField(spectrum, xInput, zInput, timeInput = 0) {
	const x = finiteNumber(xInput, 0);
	const z = finiteNumber(zInput, 0);
	const time = finiteNumber(timeInput, 0);
	let displacementX = 0;
	let displacementY = 0;
	let displacementZ = 0;
	let velocityX = spectrum.current[0];
	let velocityY = spectrum.current[1];
	let velocityZ = spectrum.current[2];
	let slopeX = 0;
	let slopeZ = 0;
	let jacobian = 1;
	for (const wave of spectrum.components) {
		const projectedPosition = wave.direction[0] * x + wave.direction[1] * z;
		const phase = wave.waveNumber * (projectedPosition - wave.speed * time) + wave.phase;
		const sine = Math.sin(phase);
		const cosine = Math.cos(phase);
		const horizontalAmplitude = wave.steepness * wave.amplitude;
		displacementX += horizontalAmplitude * wave.direction[0] * cosine;
		displacementY += wave.amplitude * sine;
		displacementZ += horizontalAmplitude * wave.direction[1] * cosine;
		const angularFrequency = wave.waveNumber * wave.speed;
		velocityX += horizontalAmplitude * wave.direction[0] * angularFrequency * sine;
		velocityY -= wave.amplitude * angularFrequency * cosine;
		velocityZ += horizontalAmplitude * wave.direction[1] * angularFrequency * sine;
		slopeX += wave.amplitude * wave.waveNumber * wave.direction[0] * cosine;
		slopeZ += wave.amplitude * wave.waveNumber * wave.direction[1] * cosine;
		jacobian -= wave.steepness * wave.waveNumber * wave.amplitude * sine;
	}
	const tidePhase = Math.PI * 2 * time / spectrum.tidePeriod + spectrum.tidePhase;
	const tide = spectrum.tideAmplitude * Math.sin(tidePhase);
	const normal = normalizeWaterVector3([-slopeX, 1, -slopeZ], [0, 1, 0]);
	const crest = Math.max(0, Math.min(1, (1 - jacobian) * 1.6));
	return Object.freeze({
		crest,
		displacement: Object.freeze([displacementX, displacementY + tide, displacementZ]),
		foam: Math.max(0, Math.min(1, crest * crest * 1.35)),
		height: spectrum.seaLevel + displacementY + tide,
		jacobian,
		normal,
		tide,
		velocity: Object.freeze([velocityX, velocityY, velocityZ]),
		x: x + displacementX,
		z: z + displacementZ
	});
}

function finiteNumber(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return fallback;
}
