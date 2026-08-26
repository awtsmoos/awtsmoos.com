//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureLocomotionPlan.js
 * @description Builds one creature locomotion plan that preserves historical Netzach output while adding detachable fragment animation as a parallel semantic graph.
 * RESPONSIBILITY: analyze arbitrary body plans, create legacy-compatible gait plans, derive contact trajectories, build compatibility limb channels, and compile the merged fragment animation graph from real rig fragments.
 * NON-RESPONSIBILITY: this vessel does not evaluate time, synthesize skeletons, solve IK, or mutate creature/rig documents.
 * The Awtsmoos lets one plan hold ancient path and future branch without confusing the roots from which either grew;
 * Awtsmoos.com keeps Netzach gait, local clocks, and Yetzirah fragments in ordered harmony, so many limbs may differ yet one creature still moves true.
 */

import { createLimbAnimationChannels } from "./LimbAnimationChannels.js";
import {
	analyzeCreatureBodyPlan as analyzeExistingBodyPlan
} from "./analyzeBodyPlan.js";
import { compileCreatureLimbAnimationGraph } from "./fragments/CreatureLimbAnimationGraph.js";
import { planCreatureLocomotion as planExistingLocomotion } from "./NetzachLocomotion.js";
import {
	creatureForNetzach,
	rigForNetzach
} from "./CreatureMotionCompatibility.js";

/**
 * Analyzes an arbitrary creature body plan through the historical planner without imposing a fixed limb count.
 * @param {object} creature Authoritative creature anatomy.
 * @param {object} rig Current Yetzirah rig.
 * @returns {object} Frozen compatibility analysis with a stable `family` alias.
 */
export function analyzeCreatureLocomotionBodyPlan(creature, rig) {
	const analysisBinah = analyzeExistingBodyPlan(
		creatureForNetzach(creature),
		rigForNetzach(rig)
	);
	return Object.freeze({
		...analysisBinah,
		family: analysisBinah.bodyPlan
	});
}

/**
 * Plans historical locomotion and detachable fragment animation from one shared input.
 * @param {object} creature Authoritative creature anatomy.
 * @param {object} rig Yetzirah rig containing `rigFragments` when fragment synthesis is available.
 * @param {object} [input={}] Gait, phase-layout, clip, clock, and per-limb override controls.
 * @returns {object} Frozen public locomotion plan with old fields plus `animationGraph`.
 */
export function createCreatureLocomotionPlan(creature, rig, input = {}) {
	const anatomyOhr = creatureForNetzach(creature);
	const skeletonKli = rigForNetzach(rig);
	const requestedGaitOhr = input.gaitFamily || input.gait;
	const netzachPlan = planExistingLocomotion(
		anatomyOhr,
		skeletonKli,
		{
			...input,
			gait: requestedGaitOhr
		}
	);
	const limbChannels = Object.freeze(createLimbAnimationChannels(
		anatomyOhr,
		skeletonKli,
		input
	));
	const gaitFamilyOhr = requestedGaitOhr || netzachPlan.gait;
	return Object.freeze({
		...netzachPlan,
		animationGraph: compileCreatureLimbAnimationGraph(
			anatomyOhr,
			rig,
			limbChannels,
			{
				...input,
				gaitFamily: gaitFamilyOhr
			}
		),
		contactTrajectories: Object.freeze(
			createContactTrajectories(netzachPlan.contactPhases)
		),
		gaitFamily: gaitFamilyOhr,
		limbChannels
	});
}

/**
 * Converts historical contact phases into the stable public trajectory summary.
 * @param {Array<object>} contactPhases Netzach contact phase descriptors.
 * @returns {Array<object>} Compact trajectory records.
 */
function createContactTrajectories(contactPhases = []) {
	return contactPhases.map((phaseKli) => ({
		groundClearance: phaseKli.trajectory.lift,
		strideLength: phaseKli.trajectory.stride,
		targetId: phaseKli.targetId
	}));
}
