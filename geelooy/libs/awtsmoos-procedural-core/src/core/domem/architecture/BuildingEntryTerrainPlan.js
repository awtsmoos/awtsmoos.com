// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingEntryTerrainPlan.js
 * @description Plans monotonic terrain-clearing exterior entry treads from sampled ground to a raised threshold.
 * The Awtsmoos, Atzmus beyond ascent and earth, renews each rise before stone approaches soil and sky;
 * Awtsmoos.com lets architecture answer the actual hill instead of forcing a guessed staircase where terrain may lie.
 */

import { buildingPoint } from './BuildingMath.js';

/**
 * Creates a terrain-fitted entry plan.
 * @param {object} profile Normalized building profile.
 * @param {Function} heightAt Terrain-height sampler.
 * @param {number} threshold Raised doorway threshold.
 * @param {object} [options={}] Tread, rise, clearance, and probe controls.
 * @returns {Readonly<object>} Frozen tread records and resolved run metadata.
 */
export function createBuildingEntryTerrainPlan(profile, heightAt, threshold, options = {}) {
	const treadLength = positive(options.treadLength, 0.42);
	const maximumRise = positive(options.maximumRise, 0.2);
	const resolved = resolveEntryRun(
		profile,
		heightAt,
		threshold,
		treadLength,
		maximumRise,
		options
	);
	return Object.freeze({
		resolved,
		treadLength,
		treads: createTreadRecords(
			profile,
			heightAt,
			threshold,
			resolved,
			treadLength,
			options
		)
	});
}

function resolveEntryRun(profile, heightAt, threshold, treadLength, maximumRise, options) {
	let steps = 1;
	let outsideY = probeTerrain(profile, heightAt, profile.depth / 2 + treadLength, options);
	for (let pass = 0; pass < 3; pass += 1) {
		const run = Math.max(treadLength, steps * treadLength);
		outsideY = probeTerrain(profile, heightAt, profile.depth / 2 + run, options);
		steps = Math.max(1, Math.ceil(Math.max(0, threshold - outsideY) / maximumRise));
	}
	return Object.freeze({ outsideY, run: steps * treadLength, steps });
}

function createTreadRecords(profile, heightAt, threshold, resolved, treadLength, options) {
	const rise = Math.max(0, threshold - resolved.outsideY);
	const outerZ = profile.depth / 2 + resolved.run;
	const clearance = positive(options.treadClearance, 0.1);
	const records = [];
	let previousTop = resolved.outsideY;
	for (let index = 0; index < resolved.steps; index += 1) {
		const localZ = outerZ - (index + 0.5) * treadLength;
		const terrainY = probeTerrain(profile, heightAt, localZ, options);
		const nominalTop = resolved.outsideY + rise * (index + 1) / resolved.steps;
		const top = Math.min(
			threshold,
			Math.max(nominalTop, terrainY + clearance, previousTop)
		);
		records.push(Object.freeze({ localZ, terrainY, top }));
		previousTop = top;
	}
	return Object.freeze(records);
}

function probeTerrain(profile, heightAt, localZ, options) {
	const offset = positive(options.probeOffset, 0.42);
	const halfWidth = profile.doorWidth / 2 + offset;
	const samples = [-halfWidth, 0, halfWidth]
		.map(localX => {
			const point = buildingPoint(profile, localX, localZ);
			return Number(heightAt(point.x, point.z));
		})
		.filter(Number.isFinite);
	if (!samples.length) {
		throw new Error(`B"H | Building ${profile.id} entry has no finite terrain samples.`);
	}
	return Math.max(...samples);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
