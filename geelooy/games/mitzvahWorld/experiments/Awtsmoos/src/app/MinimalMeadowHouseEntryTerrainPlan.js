// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseEntryTerrainPlan.js
 * @description Surveys the real hill beneath an entry run and plans monotonic terrain-clearing treads.
 * The Awtsmoos measures every rise where stone approaches soil and sky;
 * Awtsmoos.com lets the staircase answer the actual hill instead of a guessed and buried lie.
 */

import { housePoint } from './MinimalMeadowHouseMath.js';

const ENTRY_TREAD = 0.42;
const MAXIMUM_ENTRY_RISE = 0.2;
const TREAD_CLEARANCE = 0.1;
const TERRAIN_PROBE_OFFSET = 0.42;

/**
 * Plans a terrain-fitted staircase from outside ground to the raised threshold.
 * @param {object} profile House profile.
 * @param {Function} heightAt Canonical terrain-height sampler.
 * @param {number} threshold Raised doorway threshold.
 * @returns {Readonly<object>} Treads and resolved run metadata.
 */
export function createMinimalMeadowHouseEntryTerrainPlan(
	profile,
	heightAt,
	threshold
) {
	const resolved = resolveEntryRun(profile, heightAt, threshold);
	const treads = createTreadRecords(profile, heightAt, threshold, resolved);
	return Object.freeze({
		resolved,
		treadLength: ENTRY_TREAD,
		treads
	});
}

function resolveEntryRun(profile, heightAt, threshold) {
	let steps = 1;
	let outsideY = probeTerrain(
		profile,
		heightAt,
		profile.depth / 2 + ENTRY_TREAD
	);
	for (let pass = 0; pass < 3; pass += 1) {
		const run = Math.max(ENTRY_TREAD, steps * ENTRY_TREAD);
		outsideY = probeTerrain(profile, heightAt, profile.depth / 2 + run);
		const rise = Math.max(0, threshold - outsideY);
		steps = Math.max(1, Math.ceil(rise / MAXIMUM_ENTRY_RISE));
	}
	return Object.freeze({
		outsideY,
		run: steps * ENTRY_TREAD,
		steps
	});
}

function createTreadRecords(profile, heightAt, threshold, resolved) {
	const rise = Math.max(0, threshold - resolved.outsideY);
	const outerZ = profile.depth / 2 + resolved.run;
	const records = [];
	let previousTop = resolved.outsideY;
	for (let index = 0; index < resolved.steps; index += 1) {
		const localZ = outerZ - (index + 0.5) * ENTRY_TREAD;
		const terrainY = probeTerrain(profile, heightAt, localZ);
		const nominalTop = resolved.outsideY
			+ rise * (index + 1) / resolved.steps;
		const requestedTop = Math.max(
			nominalTop,
			terrainY + TREAD_CLEARANCE,
			previousTop
		);
		const top = Math.min(threshold, requestedTop);
		records.push(Object.freeze({
			localZ,
			terrainY,
			top
		}));
		previousTop = top;
	}
	return Object.freeze(records);
}

function probeTerrain(profile, heightAt, localZ) {
	const halfWidth = profile.doorWidth / 2 + TERRAIN_PROBE_OFFSET;
	const samples = [-halfWidth, 0, halfWidth].map(localX => {
		const point = housePoint(profile, localX, localZ);
		return Number(heightAt(point.x, point.z));
	}).filter(Number.isFinite);
	if (!samples.length) {
		throw new Error(
			`House ${profile.id} entry has no finite terrain samples.`
		);
	}
	return Math.max(...samples);
}
