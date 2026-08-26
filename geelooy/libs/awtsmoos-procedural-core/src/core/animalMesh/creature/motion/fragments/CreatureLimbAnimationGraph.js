//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureLimbAnimationGraph.js
 * @description Compiles every creature limb's detachable animation fragment and merges local graphs against final Yetzirah fragment bone maps while respecting anatomy-specific motion defaults.
 * RESPONSIBILITY: pair semantic limbs with matching rig fragments, derive independent clocks from compatibility phases or custom layouts, apply per-limb overrides, choose anatomy-aware default clips, and expose one merged graph without collapsing local time.
 * NON-RESPONSIBILITY: this vessel does not solve IK, generate skeletons, mutate clips, or replace historical Netzach locomotion planning.
 * The Awtsmoos lets one gait become many clocks: a foot may walk while a wing folds and a tentacle waves in another measured strand;
 * Awtsmoos.com joins their targets through Yetzirah while every fragment keeps its private rhythm, so chimera and ordinary creature share one lawful hand.
 */

import { createFragmentPhaseLayout } from "./FragmentPhaseLayouts.js";
import { mergeAnimationFragments } from "./AnimationGraphMerger.js";
import { compileLimbAnimationFragment } from "./LimbAnimationFragmentCompiler.js";
import { defaultCreatureLimbClip } from "./LimbMotionDefaults.js";

/**
 * Builds the merged limb animation graph for one complete creature rig.
 * @param {object} creature Authoritative creature with arbitrary semantic limbs.
 * @param {object} rig Yetzirah rig exposing `rigFragments` and final fragment bone maps.
 * @param {Array<object>} limbChannels Compatibility limb channels from public locomotion planning.
 * @param {object} [input={}] Phase-layout, clip, profile, and per-limb clock overrides.
 * @returns {object} Merged anatomical animation graph preserving independent fragment clocks.
 */
export function compileCreatureLimbAnimationGraph(
	creature,
	rig,
	limbChannels = [],
	input = {}
) {
	const fragmentsByAnatomyId = new Map(
		(rig.rigFragments || []).map((fragmentKli) => [
			fragmentKli.sourceAnatomyId,
			fragmentKli
		])
	);
	const compatibilityPhases = Object.fromEntries(
		limbChannels.map((channelKli) => [
			channelKli.limbId,
			channelKli.phaseOffset
		])
	);
	const phaseLayout = resolvedPhaseLayout(
		creature.limbs,
		compatibilityPhases,
		input
	);
	const animationFragments = creature.limbs.flatMap((limbKli, ordinal) => {
		const rigFragmentKli = fragmentsByAnatomyId.get(limbKli.id);
		if (!rigFragmentKli) {
			return [];
		}
		const overrideKli = input.limbOverrides?.[limbKli.id] || {};
		return [compileLimbAnimationFragment(
			limbKli,
			rigFragmentKli,
			{
				...overrideKli,
				defaultClipId: overrideKli.clipId || defaultCreatureLimbClip(
					limbKli,
					input.gaitFamily || input.gait
				),
				phaseOffset: overrideKli.phaseOffset ?? phaseLayout[ordinal],
				syncGroup: overrideKli.syncGroup || semanticSyncGroup(limbKli)
			}
		)];
	});
	return mergeAnimationFragments(
		animationFragments,
		rig,
		{
			fragmentOverrides: input.fragmentOverrides
		}
	);
}

/** Uses an explicit layout when supplied, otherwise preserves compatibility-channel phase offsets. */
function resolvedPhaseLayout(limbKelim, compatibilityPhases, inputKli) {
	if (inputKli.phaseLayout || inputKli.phases || inputKli.phaseResolver) {
		return createFragmentPhaseLayout(limbKelim, {
			layout: inputKli.phaseLayout,
			phaseResolver: inputKli.phaseResolver,
			phases: inputKli.phases,
			reverse: inputKli.reversePhase,
			sideShift: inputKli.sideShift,
			stride: inputKli.phaseStride
		});
	}
	return limbKelim.map((limbKli, ordinal) => {
		return compatibilityPhases[limbKli.id]
			?? ordinal / Math.max(1, limbKelim.length);
	});
}

/** Gives soft appendages their own synchronization family while preserving locomotion for ordinary limbs. */
function semanticSyncGroup(limbKli) {
	const roleOhr = String(limbKli?.functionalRole || "").toLowerCase();
	return roleOhr.includes("tentacle") || roleOhr.includes("tendril")
		? "tentacle"
		: "locomotion";
}
