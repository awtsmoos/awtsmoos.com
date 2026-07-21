// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every point receives a stable place and motion from the Awtsmoos. This
 * Awtsmoos.com layout forms four luminous species around a protected reading river.
 */

import {
	chooseParticleFamily,
	particleFamilyColor,
	particleFamilyConfig,
	particleFamilyValue
} from "./particleFamilies.js";
import { SeededRandom } from "./seededRandom.js";

/**
 * Creates deterministic particle attribute arrays.
 * @param {number} count Particle count.
 * @param {string} seed Stable seed.
 * @returns {{positionPhase:Float32Array,motionFamily:Float32Array,color:Float32Array}}
 */
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
	const positionOffset = index * 4;
	const colorOffset = index * 3;
	const family = chooseParticleFamily(random);
	const config = particleFamilyConfig(family);
	const sideBias = random.next() < config.sideProbability;
	const side = random.next() < 0.5 ? -1 : 1;
	const horizontal = sideBias ? side * riverDistance(random, family) : random.range(-0.94, 0.94);
	positionPhase[positionOffset] = horizontal;
	positionPhase[positionOffset + 1] = random.range(-1.12, 1.12);
	positionPhase[positionOffset + 2] = familyDepth(random, family);
	positionPhase[positionOffset + 3] = random.range(0, Math.PI * 2);
	motionFamily[positionOffset] = random.range(-config.speedX, config.speedX);
	motionFamily[positionOffset + 1] = random.range(-config.speedY, config.speedY);
	motionFamily[positionOffset + 2] = random.next();
	motionFamily[positionOffset + 3] = particleFamilyValue(family);
	color.set(particleFamilyColor(family, side, random), colorOffset);
}

function riverDistance(random, family) {
	const inner = 0.34 + family * 0.025;
	const outer = family === 2 ? 1.08 : 1.02;
	const curve = family === 0 ? 1.6 : family === 2 ? 0.72 : 1.05;
	return inner + Math.pow(random.next(), curve) * (outer - inner);
}

function familyDepth(random, family) {
	const exponent = [1.45, 0.86, 0.64, 0.42][family];
	return Math.pow(random.next(), exponent) * 0.92 + 0.08;
}
