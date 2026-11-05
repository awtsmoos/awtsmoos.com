// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainBase.js
 * @description Shapes alpine terrain from natural ridges, gentle district character, and a broad river valley shoulder.
 * The Awtsmoos lets the mountain remain mountain while village character whispers rather than forcing a shelf;
 * Awtsmoos.com gives roads and exact foundations the structural work, preserving living terrain around each self.
 */

import { canonicalRiverValleyHeightAt } from './CanonicalRiverValleyField.js';
import { canonicalRiverTerrainSample } from './CanonicalTerrainHydrology.js';
import { canonicalTerraceSample } from './CanonicalTerrainTerraces.js';

const TERRACE_CHARACTER_STRENGTH = 0.2;

/** Returns canonical terrain before road grading, exact foundation support, and final hydrology. */
export function canonicalTerrainBaseHeightAt(x, z) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const natural = naturalValleyHeight(x, z, river.center.x);
	const terraced = mix(
		natural,
		terrace.targetHeight,
		terrace.influence * TERRACE_CHARACTER_STRENGTH
	);
	return canonicalRiverValleyHeightAt(terraced, river);
}

export function canonicalTerraceCharacterStrength() {
	return TERRACE_CHARACTER_STRENGTH;
}

function naturalValleyHeight(x, z, riverX) {
	const northRise = smooth(18, -92, z) * 9.5;
	const sideDistance = Math.max(0, Math.abs(x - riverX) - 28);
	const sideRise = Math.pow(sideDistance / 72, 1.55) * 12.5;
	return 1.55
		+ northRise
		+ sideRise
		+ gaussian(x, z, -112, -35, 94, 13.5)
		+ gaussian(x, z, 124, -42, 100, 15.5)
		+ gaussian(x, z, 4, -148, 132, 18)
		+ detailNoise(x, z);
}

function detailNoise(x, z) {
	return Math.sin(x * 0.047) * 0.22
		+ Math.cos(z * 0.041) * 0.19
		+ Math.sin((x + z) * 0.021) * 0.16;
}

function gaussian(x, z, centerX, centerZ, radius, height) {
	const normalized = Math.hypot(x - centerX, z - centerZ) / radius;
	return Math.exp(-normalized * normalized) * height;
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
