// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseEntrySupport.js
 * @description Coordinates terrain planning, visible stair manifestation, and gameplay height support.
 * The Awtsmoos joins survey, stone, and walkable covenant without confusing their role;
 * Awtsmoos.com lets Tiferes bind three focused vessels into one doorway from hillside to home and soul.
 */

import {
	createMinimalMeadowHouseEntryHeightSupport
} from './MinimalMeadowHouseEntryHeightSupport.js';
import {
	createMinimalMeadowHouseEntryTerrainPlan
} from './MinimalMeadowHouseEntryTerrainPlan.js';
import {
	createMinimalMeadowHouseEntryTreads
} from './MinimalMeadowHouseEntryTreads.js';

/**
 * Creates a complete terrain-adaptive house entry.
 * @param {object} profile House profile.
 * @param {object} material Foundation material.
 * @param {number} groundY Raised foundation datum.
 * @param {Function} heightAt Canonical terrain-height sampler.
 * @returns {object} Stair definitions, evidence, and gameplay support adapter.
 */
export function createMinimalMeadowHouseEntrySupport(
	profile,
	material,
	groundY,
	heightAt
) {
	const threshold = groundY + profile.floorThickness;
	const plan = createMinimalMeadowHouseEntryTerrainPlan(
		profile,
		heightAt,
		threshold
	);
	return {
		definitions: createMinimalMeadowHouseEntryTreads(
			profile,
			material,
			plan.treads,
			plan.treadLength
		),
		evidence: entryEvidence(plan.treads, threshold, plan.resolved),
		support: createMinimalMeadowHouseEntryHeightSupport(
			profile,
			threshold,
			plan.treads,
			plan.resolved,
			plan.treadLength
		)
	};
}

function entryEvidence(treads, threshold, resolved) {
	const tops = treads.map(record => record.top);
	const rises = tops.map((top, index) => {
		const previous = tops[index - 1] ?? resolved.outsideY;
		return top - previous;
	});
	const clearances = treads.map(record => record.top - record.terrainY);
	return Object.freeze({
		maximumRise: Math.max(0, ...rises),
		minimumTerrainClearance: Math.min(...clearances),
		rise: Math.max(0, threshold - resolved.outsideY),
		run: resolved.run,
		steps: resolved.steps
	});
}
