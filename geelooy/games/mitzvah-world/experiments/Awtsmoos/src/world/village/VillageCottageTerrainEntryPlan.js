// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageTerrainEntryPlan.js
 * @description Plans bounded stairs from sampled hillside terrain to the canonical finished floor.
 * The Awtsmoos measures each approach anew, from mountain grain to household door;
 * Awtsmoos.com lets every tread answer the earth beneath it while rising gently to the floor.
 */

import {
	villageCottageMaximumEntryRise,
	villageCottageMinimumEntryClearance
} from './VillageCottageTerrainEntryEvidence.js';
import {
	sampleVillageCottageEntryGround
} from './VillageCottageTerrainEntryGround.js';

const FINISHED_FLOOR_LIFT = 0.16;
const GROUND_CLEARANCE = 0.08;
const GROUND_EMBED = 0.18;
const MAXIMUM_RISE = 0.2;
const MAXIMUM_STEPS = 16;
const TREAD_DEPTH = 0.46;
const TREAD_WIDTH = 2.6;

/**
 * Plans terrain-fitted stair records in outside-to-door order.
 * @param {object} cottage Canonical cottage facade options.
 * @param {object|Function} groundSampler Shared village ground authority.
 * @returns {Readonly<object>} Threshold, run, evidence, and immutable tread records.
 */
export function planVillageCottageTerrainEntry(cottage, groundSampler) {
	const threshold = Number(cottage.base) + FINISHED_FLOOR_LIFT;
	const frontZ = Number(cottage.depth) / 2 + 0.12;
	const resolved = resolveEntryRun(cottage, groundSampler, frontZ, threshold);
	const treads = createTreads(
		cottage,
		groundSampler,
		frontZ,
		threshold,
		resolved
	);
	return Object.freeze({
		maximumRise: villageCottageMaximumEntryRise(
			treads,
			resolved.outsideGround
		),
		minimumClearance: villageCottageMinimumEntryClearance(treads),
		outsideGround: resolved.outsideGround,
		run: resolved.steps * TREAD_DEPTH,
		steps: Object.freeze(treads),
		threshold,
		treadDepth: TREAD_DEPTH,
		treadWidth: TREAD_WIDTH
	});
}

function resolveEntryRun(cottage, groundSampler, frontZ, threshold) {
	let steps = 2;
	let outsideGround = entryGround(cottage, groundSampler, frontZ, steps);
	for (let pass = 0; pass < 4; pass += 1) {
		outsideGround = entryGround(cottage, groundSampler, frontZ, steps);
		const rise = Math.max(0, threshold - outsideGround);
		const nextSteps = Math.max(
			1,
			Math.min(MAXIMUM_STEPS, Math.ceil(rise / MAXIMUM_RISE))
		);
		if (nextSteps === steps) {
			break;
		}
		steps = nextSteps;
	}
	return Object.freeze({ outsideGround, steps });
}

function createTreads(cottage, groundSampler, frontZ, threshold, resolved) {
	const run = resolved.steps * TREAD_DEPTH;
	const rise = Math.max(0, threshold - resolved.outsideGround);
	const treads = [];
	let previousTop = resolved.outsideGround;
	for (let index = 0; index < resolved.steps; index += 1) {
		const localZ = frontZ + run - (index + 0.5) * TREAD_DEPTH;
		const terrainY = sampleVillageCottageEntryGround(
			cottage,
			groundSampler,
			localZ,
			TREAD_WIDTH
		);
		const nominalTop = resolved.outsideGround
			+ rise * (index + 1) / resolved.steps;
		const top = Math.min(
			threshold,
			Math.max(nominalTop, terrainY + GROUND_CLEARANCE, previousTop)
		);
		treads.push(Object.freeze({
			bottom: Math.min(terrainY - GROUND_EMBED, top - 0.24),
			localZ,
			terrainY,
			top
		}));
		previousTop = top;
	}
	return treads;
}

function entryGround(cottage, groundSampler, frontZ, steps) {
	return sampleVillageCottageEntryGround(
		cottage,
		groundSampler,
		frontZ + steps * TREAD_DEPTH,
		TREAD_WIDTH
	);
}
