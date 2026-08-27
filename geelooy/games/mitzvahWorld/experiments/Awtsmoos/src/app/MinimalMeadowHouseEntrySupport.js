// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseEntrySupport.js
 * @description Builds visible threshold steps and exact discrete support from terrain to floor.
 * The Awtsmoos joins meadow and doorway through many level rises; Awtsmoos.com keeps every
 * visible step non-trapping while one measured sampler carries feet to the raised foundation.
 */

import { houseBox, housePoint } from './MinimalMeadowHouseMath.js';

const ENTRY_TREAD = 0.38;
const MAXIMUM_ENTRY_RISE = 0.2;

export function createMinimalMeadowHouseEntrySupport(
	profile,
	material,
	groundY,
	heightAt
) {
	const threshold = groundY + profile.floorThickness;
	const outside = housePoint(profile, 0, profile.depth / 2 + 14);
	const outsideY = heightAt(outside.x, outside.z);
	const rise = Math.max(0, threshold - outsideY);
	const steps = Math.max(1, Math.ceil(rise / MAXIMUM_ENTRY_RISE));
	const run = steps * ENTRY_TREAD;
	const outerZ = profile.depth / 2 + run;
	const definitions = [];
	for (let index = 0; index < steps; index += 1) {
		const top = outsideY + rise * (index + 1) / steps;
		const bottom = outsideY - 0.16;
		definitions.push(houseBox(
			profile,
			material,
			`entry-step-${index + 1}`,
			0,
			(top + bottom) / 2,
			outerZ - (index + 0.5) * ENTRY_TREAD,
			{
				x: profile.doorWidth + 1.6,
				y: top - bottom,
				z: ENTRY_TREAD + 0.02
			},
			{
				role: 'visual-discrete-entry-step',
				solid: false,
				walkable: false
			}
		));
	}
	return {
		definitions,
		evidence: Object.freeze({
			maximumRise: rise / steps,
			rise,
			run,
			steps
		}),
		support: createEntrySupport(
			profile,
			outsideY,
			threshold,
			steps,
			run,
			outerZ
		)
	};
}

function createEntrySupport(profile, outsideY, threshold, steps, run, outerZ) {
	const rise = (threshold - outsideY) / steps;
	return Object.freeze({
		heightAt(x, z, currentY) {
			const local = houseLocalPoint(profile, x, z);
			if (Math.abs(local.x) > (profile.doorWidth + 1.8) / 2) return null;
			const innerZ = profile.depth / 2 - 0.42;
			if (local.z < innerZ || local.z > outerZ + 0.18) return null;
			if (local.z <= profile.depth / 2 + 0.18) return threshold;
			const progress = Math.max(0, outerZ - local.z);
			const index = Math.min(steps - 1, Math.floor(progress / ENTRY_TREAD));
			const height = outsideY + rise * (index + 1);
			if (Number.isFinite(currentY) && currentY > height + 1.1) return null;
			return height;
		},
		kind: 'entry',
		maximumRise: rise,
		outerZ,
		profileId: profile.id,
		run,
		steps,
		threshold,
		tread: ENTRY_TREAD
	});
}

function houseLocalPoint(profile, x, z) {
	const dx = x - profile.x;
	const dz = z - profile.z;
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}
