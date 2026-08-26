//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureLimbAnimationGraph.js
 * @description Compiles every creature limb's detachable animation fragment and merges those local graphs against the final Yetzirah fragment bone maps.
 * RESPONSIBILITY: pair limbs with matching rig fragments, derive independent clocks from gait channels or custom phase layouts, apply per-limb overrides, and expose one merged graph without collapsing local time.
 * NON-RESPONSIBILITY: this vessel does not solve IK, generate skeletons, alter clips, or replace historical Netzach locomotion planning.
 * The Awtsmoos lets one gait become many clocks: each limb receives the shared song yet may enter early, late, fast, slow, restrained, or grand;
 * Awtsmoos.com joins their targets through Yetzirah while leaving every fragment's private rhythm alive within the creature's hand.
 */

import { createFragmentPhaseLayout } from "./FragmentPhaseLayouts.js";
import { mergeAnimationFragments } from "./AnimationGraphMerger.js";
import { compileLimbAnimationFragment } from "./LimbAnimationFragmentCompiler.js";

/**
 * Builds the merged limb animation graph for one complete creature rig.
 * @param {object} creature Authoritative creature with arbitrary limbs.
 * @param {object} rig Yetzirah rig exposing `rigFragments` and final fragment bone maps.
 * @param {Array<object>} limbChannels Compatibility limb channels from the public locomotion planner.
 * @param {object} [input={}] Phase-layout, clip, and per-limb clock overrides.
 * @returns {object} Merged anatomical animation graph.
 */
export function compileCreatureLimbAnimationGraph(
	creature,
	rig,
	limbChannels = [],
	input = {}
) {
	const fragmentsByAnatomyId = new Map(
		(rig.rigFragments || []).map((fragment) => [
			fragment.sourceAnatomyId,
			fragment
		])
	);
	const compatibilityPhases = Object.fromEntries(
		limbChannels.map((channel) => [channel.limbId, channel.phaseOffset])
	);
	const phaseLayout = resolvedPhaseLayout(
		creature.limbs,
		compatibilityPhases,
		input
	);
	const fragments = creature.limbs.flatMap((limb, index) => {
		const rigFragment = fragmentsByAnatomyId.get(limb.id);
		if (!rigFragment) {
			return [];
		}
		const override = input.limbOverrides?.[limb.id] || {};
		return [compileLimbAnimationFragment(
			limb,
			rigFragment,
			{
				...override,
				defaultClipId: override.clipId || gaitClip(input.gaitFamily || input.gait),
				phaseOffset: override.phaseOffset ?? phaseLayout[index],
				syncGroup: override.syncGroup || "locomotion"
			}
		)];
	});
	return mergeAnimationFragments(
		fragments,
		rig,
		{
			fragmentOverrides: input.fragmentOverrides
		}
	);
}

/** Uses explicit phase layout controls when supplied, otherwise preserves current compatibility-channel phase offsets. */
function resolvedPhaseLayout(limbs, compatibilityPhases, input) {
	if (input.phaseLayout || input.phases || input.phaseResolver) {
		return createFragmentPhaseLayout(limbs, {
			layout: input.phaseLayout,
			phaseResolver: input.phaseResolver,
			phases: input.phases,
			reverse: input.reversePhase,
			sideShift: input.sideShift,
			stride: input.phaseStride
		});
	}
	return limbs.map((limb, index) => {
		return compatibilityPhases[limb.id]
			?? index / Math.max(1, limbs.length);
	});
}

/** Maps common creature-wide gait names into detachable limb clip families. */
function gaitClip(gait) {
	const normalized = String(gait || "walk").toLowerCase();
	if (normalized.includes("trot")) {
		return "trot";
	}
	if (normalized.includes("run") || normalized.includes("gallop")) {
		return "run";
	}
	if (normalized.includes("bound") || normalized.includes("hop")) {
		return "bound";
	}
	return "walk";
}
