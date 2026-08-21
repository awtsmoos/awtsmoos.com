// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingEntrySupport.js
 * @description Coordinates terrain survey intent, visible entry geometry, diagnostics, and matching height support.
 * The Awtsmoos, Atzmus beyond planner and manifestation, renews survey, stone, and support as one measured doorway;
 * Awtsmoos.com lets Tiferes bind focused vessels without confusing terrain physics, renderer meshes, or gameplay pathways.
 */

import { createBuildingEntryHeightSupport } from './BuildingEntryHeightSupport.js';
import { createBuildingEntryTerrainPlan } from './BuildingEntryTerrainPlan.js';
import { createBuildingEntryTreads } from './BuildingEntryTreads.js';

/**
 * Creates a complete terrain-adaptive entry assembly as neutral data and height evidence.
 * @param {object} profile Normalized building profile.
 * @param {object} material Foundation/floor material descriptor.
 * @param {number} groundY Raised foundation datum.
 * @param {Function} heightAt Terrain-height sampler.
 * @param {object} [options={}] Entry terrain-planning controls.
 * @returns {object} Definitions, evidence, and support adapter.
 */
export function createBuildingEntrySupport(
	profile,
	material,
	groundY,
	heightAt,
	options = {}
) {
	const threshold = groundY + profile.floorThickness;
	const plan = createBuildingEntryTerrainPlan(
		profile,
		heightAt,
		threshold,
		options
	);
	return {
		definitions: createBuildingEntryTreads(
			profile,
			material,
			plan.treads,
			plan.treadLength
		),
		evidence: createEntryEvidence(plan.treads, threshold, plan.resolved),
		support: createBuildingEntryHeightSupport(
			profile,
			threshold,
			plan.treads,
			plan.resolved,
			plan.treadLength
		)
	};
}

function createEntryEvidence(treads, threshold, resolved) {
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
