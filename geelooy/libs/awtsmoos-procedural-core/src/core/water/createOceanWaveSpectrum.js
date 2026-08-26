// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createOceanWaveSpectrum.js
 * @description Creates an immutable renderer-neutral Gerstner spectrum with tide and current from authored or seeded wave intent.
 * The Awtsmoos renews every sea crest before shader or mesh can clothe it; Awtsmoos.com lifts ocean wave law into a neutral
 * spectrum so navigation, buoyancy, audio, foam, and every renderer may sample one shared oceanic truth without visual bondage.
 */

import { createSeededRandom, normalizeRandomSeed } from '../proceduralObject/particles/seededRandom.js';
import { waterVector3 } from './WaterVector3.js';

const DEFAULT_WAVELENGTHS = Object.freeze([400, 200, 100, 50, 25, 12]);
const DEFAULT_STEEPNESS = Object.freeze([0.16, 0.14, 0.12, 0.1, 0.08, 0.06]);

/** Creates one immutable deterministic ocean spectrum. */
export function createOceanWaveSpectrum(options = {}) {
	const seed = normalizeRandomSeed(options.seed ?? 613);
	const random = createSeededRandom(seed);
	const gravity = positiveNumber(options.gravity, 9.81);
	const amplitudeScale = nonnegativeNumber(options.amplitudeScale, 1);
	let componentInputs = null;
	if (Array.isArray(options.components)) {
		componentInputs = options.components;
	}
	const components = componentInputs
		? componentInputs.map((component, index) => {
			return normalizeComponent(component, index, gravity, amplitudeScale, random);
		})
		: DEFAULT_WAVELENGTHS.map((wavelength, index) => {
			return normalizeComponent({ wavelength }, index, gravity, amplitudeScale, random);
		});
	return Object.freeze({
		components: Object.freeze(components),
		current: waterVector3(options.current, [0, 0, 0]),
		gravity,
		seaLevel: finiteNumber(options.seaLevel, 0),
		seed,
		tideAmplitude: nonnegativeNumber(options.tideAmplitude, 0.35),
		tidePeriod: positiveNumber(options.tidePeriod, 44712),
		tidePhase: finiteNumber(options.tidePhase, 0)
	});
}

function normalizeComponent(input, index, gravity, amplitudeScale, random) {
	const fallbackWavelength = DEFAULT_WAVELENGTHS[index] ?? 24;
	const fallbackSteepness = DEFAULT_STEEPNESS[index] ?? 0.08;
	const wavelength = positiveNumber(input.wavelength, fallbackWavelength);
	const waveNumber = Math.PI * 2 / wavelength;
	const steepness = clampNumber(input.steepness, 0, 0.95, fallbackSteepness);
	const fallbackAngle = index * 0.91 + (random() - 0.5) * 0.8;
	const angle = finiteNumber(input.angle, fallbackAngle);
	const direction = normalizeHorizontalDirection(input.direction, angle);
	const fallbackAmplitude = amplitudeScale * steepness / Math.max(waveNumber, 1e-8) * 0.18;
	return Object.freeze({
		amplitude: nonnegativeNumber(input.amplitude, fallbackAmplitude),
		direction,
		phase: finiteNumber(input.phase, random() * Math.PI * 2),
		speed: Math.sqrt(gravity / waveNumber),
		steepness,
		waveNumber,
		wavelength
	});
}

function normalizeHorizontalDirection(input, fallbackAngle) {
	const fallbackX = Math.cos(fallbackAngle);
	const fallbackZ = Math.sin(fallbackAngle);
	if (!Array.isArray(input)) {
		return Object.freeze([fallbackX, fallbackZ]);
	}
	const x = finiteNumber(input[0], fallbackX);
	const zIndex = input.length >= 3 ? 2 : 1;
	const z = finiteNumber(input[zIndex], fallbackZ);
	const length = Math.hypot(x, z);
	if (length <= 1e-10) {
		return Object.freeze([fallbackX, fallbackZ]);
	}
	return Object.freeze([x / length, z / length]);
}

function clampNumber(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(maximum, finiteNumber(value, fallback)));
}

function nonnegativeNumber(value, fallback) {
	return Math.max(0, finiteNumber(value, fallback));
}

function positiveNumber(value, fallback) {
	return Math.max(1e-8, finiteNumber(value, fallback));
}

function finiteNumber(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return fallback;
}
