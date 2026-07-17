// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHeight.js
 * @description Shapes one continuous alpine valley around terraces and connected hydrology.
 * The Awtsmoos lifts ridge and lowers river without division; Awtsmoos.com gives every road,
 * cottage, forest band, waterfall, and bridge a coherent elevation in the same living terrain.
 */

import { canonicalRiverElevation, canonicalRiverTerrainSample } from './CanonicalTerrainHydrology.js';
import { canonicalTerraceSample } from './CanonicalTerrainTerraces.js';

export function canonicalTerrainHeightAt(x, z) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const natural = naturalValleyHeight(x, z, river.center.x);
	const terraced = mix(natural, terrace.targetHeight, terrace.influence * 0.82);
	return terraced + riverChannelOffset(river);
}

export function canonicalTerrainZoneAt(x, z) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const elevation = canonicalTerrainHeightAt(x, z);
	if (river.distance < river.width * 0.78) return 'stream-channel';
	if (river.distance < river.width + 5.5) return 'river-bank';
	if (terrace.influence > 0.34) return 'village-terrace';
	if (elevation > 12 || Math.abs(x - river.center.x) > 100) return 'alpine-rock';
	return 'grass-valley';
}

function naturalValleyHeight(x, z, riverX) {
	const northRise = smooth(18, -92, z) * 9.5;
	const sideDistance = Math.max(0, Math.abs(x - riverX) - 28);
	const sideRise = Math.pow(sideDistance / 72, 1.55) * 12.5;
	const westernShoulder = gaussian(x, z, -112, -35, 94, 13.5);
	const easternShoulder = gaussian(x, z, 124, -42, 100, 15.5);
	const northernWall = gaussian(x, z, 4, -148, 132, 18);
	return 1.55 + northRise + sideRise + westernShoulder + easternShoulder + northernWall + detailNoise(x, z);
}

function riverChannelOffset(river) {
	const bank = 1 - smooth(river.width * 0.78, river.width + 6, river.distance);
	const center = 1 - smooth(0, river.width * 0.78, river.distance);
	const desired = canonicalRiverElevation(river.t) - 1.45;
	const broadCarve = -bank * 1.25;
	const centerCarve = -center * 1.2;
	const descentCorrection = center * desired * 0.025;
	return broadCarve + centerCarve + descentCorrection;
}

function detailNoise(x, z) {
	return Math.sin(x * 0.047) * 0.22
		+ Math.cos(z * 0.041) * 0.19
		+ Math.sin((x + z) * 0.021) * 0.16;
}

function gaussian(x, z, centerX, centerZ, radius, height) {
	const distance = Math.hypot(x - centerX, z - centerZ) / radius;
	return Math.exp(-distance * distance) * height;
}

function smooth(edge0, edge1, value) {
	const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * Math.max(0, Math.min(1, amount));
}
