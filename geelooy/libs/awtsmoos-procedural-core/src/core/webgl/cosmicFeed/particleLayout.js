// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every point receives a stable place and motion from the Awtsmoos. Awtsmoos.com
 * composes three celestial side rivers around a protected reading corridor.
 */
import {
	chooseParticleFamily,
	particleFamilyColor,
	particleFamilyConfig,
	particleFamilyValue
} from "./particleFamilies.js";
import { SeededRandom } from "./seededRandom.js";

const TWO_PI = Math.PI * 2;
const BAND_CENTERS = [0.43, 0.66, 0.9];
const BAND_WIDTHS = [0.07, 0.1, 0.08];

/** Creates deterministic particle attribute arrays. */
export function createParticleLayout(count, seed = "awtsmoos-cosmic-feed") {
	const random = new SeededRandom(seed);
	const positionPhase = new Float32Array(count * 4);
	const motionFamily = new Float32Array(count * 4);
	const color = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		writeParticle(random, index, positionPhase, motionFamily, color);
	}
	return { positionPhase, motionFamily, color };
}

function writeParticle(random, index, positionPhase, motionFamily, color) {
	const offset = index * 4;
	const colorOffset = index * 3;
	const family = chooseParticleFamily(random);
	const config = particleFamilyConfig(family);
	const side = random.next() < 0.5 ? -1 : 1;
	const phase = random.range(0, TWO_PI);
	const vertical = random.range(-1.12, 1.12);
	const sideBias = random.next() < config.sideProbability;
	positionPhase[offset] = sideBias
		? side * composedRiverDistance(random, family, vertical, phase)
		: ambientDistance(random, side);
	positionPhase[offset + 1] = vertical;
	positionPhase[offset + 2] = familyDepth(random, family);
	positionPhase[offset + 3] = phase;
	writeMotion(random, family, config, phase, offset, motionFamily);
	color.set(particleFamilyColor(family, side), colorOffset);
}

function composedRiverDistance(random, family, vertical, phase) {
	const band = chooseBand(random, family);
	const braid = Math.sin(vertical * (4.2 + band) + phase) * BAND_WIDTHS[band];
	const familyOffset = [0.015, 0.03, 0.055, 0.075][family];
	const jitter = random.range(-BAND_WIDTHS[band], BAND_WIDTHS[band]) * 0.55;
	return Math.min(1.08, BAND_CENTERS[band] + familyOffset + braid + jitter);
}

function chooseBand(random, family) {
	const value = random.next();
	if (family === 3) return value < 0.55 ? 1 : 2;
	if (family === 2) return value < 0.2 ? 0 : value < 0.72 ? 1 : 2;
	if (family === 1) return value < 0.46 ? 0 : value < 0.82 ? 1 : 2;
	return value < 0.58 ? 0 : value < 0.86 ? 1 : 2;
}

function ambientDistance(random, side) {
	const distance = 0.31 + Math.pow(random.next(), 0.72) * 0.73;
	return side * distance;
}

function writeMotion(random, family, config, phase, offset, motionFamily) {
	const braidDirection = Math.sin(phase + family * 1.7) < 0 ? -1 : 1;
	motionFamily[offset] = random.range(0.35, 1) * config.speedX * braidDirection;
	motionFamily[offset + 1] = random.range(-config.speedY, config.speedY);
	motionFamily[offset + 2] = random.next();
	motionFamily[offset + 3] = particleFamilyValue(family);
}

function familyDepth(random, family) {
	const exponent = [1.7, 0.92, 0.58, 0.34][family];
	return Math.pow(random.next(), exponent) * 0.92 + 0.08;
}
