// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseFoundation.js
 * @description Levels each footprint, skirts terrain, and installs discrete threshold support.
 * The Awtsmoos raises a stable home from rolling earth without moving the earth itself;
 * Awtsmoos.com keeps platform, stone, visible steps, and exact level footing in distinct vessels.
 */

import {
	createMinimalMeadowHouseEntrySupport
} from './MinimalMeadowHouseEntrySupport.js';
import { houseBox, housePoint } from './MinimalMeadowHouseMath.js';

const SAMPLE_STEPS = 8;

export function createMinimalMeadowHouseFoundation(
	profile,
	materials,
	heightAt
) {
	const measurement = measureFootprint(profile, heightAt);
	const groundY = measurement.maximum + 0.18;
	const entry = createMinimalMeadowHouseEntrySupport(
		profile,
		materials.floor,
		groundY,
		heightAt
	);
	const definitions = [
		platform(profile, materials.floor, groundY),
		...skirts(profile, materials.floor, groundY, measurement.minimum),
		...entry.definitions
	];
	return {
		definitions,
		evidence: Object.freeze({
			entryRise: entry.evidence.rise,
			entryRun: entry.evidence.run,
			entrySteps: entry.evidence.steps,
			maximumStepRise: entry.evidence.maximumRise,
			platformY: groundY,
			terrainMaximum: measurement.maximum,
			terrainMinimum: measurement.minimum,
			terrainVariance: measurement.maximum - measurement.minimum
		}),
		groundY,
		support: entry.support
	};
}

function measureFootprint(profile, heightAt) {
	const heights = [];
	for (let row = 0; row <= SAMPLE_STEPS; row += 1) {
		for (let column = 0; column <= SAMPLE_STEPS; column += 1) {
			const point = housePoint(
				profile,
				(column / SAMPLE_STEPS - 0.5) * profile.width,
				(row / SAMPLE_STEPS - 0.5) * profile.depth
			);
			heights.push(heightAt(point.x, point.z));
		}
	}
	return {
		maximum: Math.max(...heights),
		minimum: Math.min(...heights)
	};
}

function platform(profile, material, groundY) {
	return houseBox(
		profile,
		material,
		'foundation-platform',
		0,
		groundY - profile.foundationThickness / 2,
		0,
		{
			x: profile.width,
			y: profile.foundationThickness,
			z: profile.depth
		},
		{ role: 'level-foundation-platform', walkable: true }
	);
}

function skirts(profile, material, top, terrainMinimum) {
	const bottom = terrainMinimum - 0.45;
	const height = Math.max(0.5, top - bottom);
	const y = bottom + height / 2;
	const thickness = profile.wallThickness;
	return [
		houseBox(profile, material, 'foundation-front-skirt', 0, y, profile.depth / 2, { x: profile.width, y: height, z: thickness }),
		houseBox(profile, material, 'foundation-back-skirt', 0, y, -profile.depth / 2, { x: profile.width, y: height, z: thickness }),
		houseBox(profile, material, 'foundation-left-skirt', -profile.width / 2, y, 0, { x: thickness, y: height, z: profile.depth }),
		houseBox(profile, material, 'foundation-right-skirt', profile.width / 2, y, 0, { x: thickness, y: height, z: profile.depth })
	];
}
