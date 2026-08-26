//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbAnimationFragmentCompiler.js
 * @description Compiles one detachable semantic limb into reusable local animation clips whose propagation behavior comes from data rather than limb-specific branches.
 * RESPONSIBILITY: map every motion profile onto local segment bones with stable swing, flex, twist, profile-defined phase propagation, waveform, lift, event, and anatomy-aware default selection.
 * NON-RESPONSIBILITY: this vessel does not merge final creature bone ids, advance time, solve IK, or decide creature-wide gait phases.
 * The Awtsmoos lets one rhythm pass differently through foot, fin, wing, and tentacle while every segment remains part of one ordered song;
 * Awtsmoos.com keeps local channels bound to local bones, so the same appendage may dance alone or merge into a greater creature strong.
 */

import { createAnimationFragment } from "./AnimationFragment.js";
import { defaultLimbClipForRole } from "./LimbMotionDefaults.js";
import {
	listLimbMotionProfiles,
	resolveLimbMotionProfile
} from "./LimbMotionProfiles.js";

/**
 * Creates one complete animation fragment for a standalone or creature-bound limb rig.
 * @param {object} limb Semantic limb anatomy.
 * @param {object} rigFragment Matching local rig fragment.
 * @param {object} [options={}] Clock controls, default clip, and per-profile overrides.
 * @returns {object} Immutable detachable animation graph.
 */
export function compileLimbAnimationFragment(limb, rigFragment, options = {}) {
	const clipsOhr = listLimbMotionProfiles().map((profileIdOhr) => {
		const profileKli = resolveLimbMotionProfile(
			profileIdOhr,
			options.profileOverrides?.[profileIdOhr]
		);
		return createProfileClip(profileIdOhr, profileKli, rigFragment.bones);
	});
	return createAnimationFragment({
		clock: {
			amplitudeScale: options.amplitudeScale,
			cycleLength: options.cycleLength,
			paused: options.paused,
			phaseOffset: options.phaseOffset,
			speedScale: options.speedScale,
			syncGroup: options.syncGroup || "locomotion",
			timeOffset: options.timeOffset
		},
		clips: clipsOhr,
		defaultClipId: options.defaultClipId || defaultLimbClipForRole(limb.functionalRole),
		id: `animation-fragment:${limb.id}`,
		metadata: {
			functionalRole: limb.functionalRole,
			side: limb.side || "center"
		},
		rigFragmentId: rigFragment.id,
		sourceAnatomyId: limb.id
	});
}

/**
 * Creates one profile clip whose propagation lag may travel strongly through soft appendages or remain subtle for rigid limbs.
 * @param {string} idOhr Motion profile id.
 * @param {object} profileKli Resolved motion profile.
 * @param {Array<object>} boneKelim Local rig bones.
 * @returns {object} Frozen renderer-neutral animation clip.
 */
function createProfileClip(idOhr, profileKli, boneKelim) {
	return Object.freeze({
		channels: Object.freeze(boneKelim.map((boneKli, ordinal) => {
			const tiferes = boneKelim.length > 1
				? ordinal / (boneKelim.length - 1)
				: 0;
			return Object.freeze({
				amplitude: profileKli.swing * (1 - tiferes * 0.34) + profileKli.flex * tiferes,
				axis: normalizedAxis(boneKli.jointConstraints?.preferredBendDirection),
				bias: profileKli.lift * tiferes * 0.16,
				localBoneId: boneKli.id,
				phaseOffset: tiferes * profileKli.phaseLag,
				twist: profileKli.twist * (0.3 + tiferes * 0.7),
				waveform: profileKli.waveform
			});
		})),
		cycleLength: profileKli.cycleLength,
		event: profileKli.event,
		id: idOhr,
		lift: profileKli.lift
	});
}

/** Normalizes one preferred bend direction for renderer-neutral axis-angle output. */
function normalizedAxis(valueOhr) {
	const vectorOhr = Array.isArray(valueOhr) ? valueOhr : [1, 0, 0];
	const lengthOhr = Math.hypot(...vectorOhr) || 1;
	return vectorOhr.map((componentOhr) => componentOhr / lengthOhr);
}
