// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseFoundation.js
	* @description Samples each full footprint, levels its floor, skirts terrain, and builds entry steps.
	* The Awtsmoos raises a stable threshold from rolling earth without moving the earth itself;
	* Awtsmoos.com binds sampled extrema, visible stone, walkable tops, and exact collider definitions.
	*/

import { houseBox, housePoint } from './MinimalMeadowHouseMath.js';

const SAMPLE_STEPS = 8;
const ENTRY_TREAD = 0.38;
const MAXIMUM_ENTRY_RISE = 0.2;

export function createMinimalMeadowHouseFoundation(profile, materials, heightAt) {
	const measurement = measureFootprint(profile, heightAt);
	const groundY = measurement.maximum + 0.18;
	const definitions = [platform(profile, materials.floor, groundY)];
	definitions.push(...skirts(profile, materials.floor, groundY, measurement.minimum));
	const approach = entryApproach(profile, materials.floor, groundY, heightAt);
	definitions.push(...approach.definitions);
	return {
		definitions,
		evidence: Object.freeze({
			entryRise: approach.rise,
			entrySteps: approach.steps,
			maximumStepRise: approach.maximumRise,
			platformY: groundY,
			terrainMaximum: measurement.maximum,
			terrainMinimum: measurement.minimum,
			terrainVariance: measurement.maximum - measurement.minimum
		}),
		groundY
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
	return { maximum: Math.max(...heights), minimum: Math.min(...heights) };
}

function platform(profile, material, groundY) {
	return houseBox(profile, material, 'foundation-platform', 0, groundY - profile.foundationThickness / 2, 0, {
		x: profile.width,
		y: profile.foundationThickness,
		z: profile.depth
	}, { role: 'level-foundation-platform', walkable: true });
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

function entryApproach(profile, material, groundY, heightAt) {
	const threshold = groundY + profile.floorThickness;
	const outside = housePoint(profile, 0, profile.depth / 2 + 14);
	const outsideY = heightAt(outside.x, outside.z);
	const rise = Math.max(0, threshold - outsideY);
	const steps = Math.max(1, Math.ceil(rise / MAXIMUM_ENTRY_RISE));
	const run = steps * ENTRY_TREAD;
	const definitions = [];
	for (let index = 0; index < steps; index += 1) {
		const top = outsideY + rise * (index + 1) / steps;
		const bottom = outsideY - 0.16;
		definitions.push(houseBox(profile, material, `entry-step-${index + 1}`, 0, (top + bottom) / 2, profile.depth / 2 + run - (index + 0.5) * ENTRY_TREAD, {
			x: profile.doorWidth + 1.6,
			y: top - bottom,
			z: ENTRY_TREAD + 0.02
		}, { role: 'human-entry-step', walkable: true }));
	}
	return { definitions, maximumRise: rise / steps, rise, steps };
}
