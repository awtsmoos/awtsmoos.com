// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbAnimationFragmentCompiler.js
 * @description Compiles one detachable limb rig fragment into a reusable procedural animation fragment with a broad local motion vocabulary.
 * RESPONSIBILITY: map motion profiles onto local segment bones with stable swing, flex, twist, phase-lag, lift, and event channels.
 * NON-RESPONSIBILITY: this file does not merge final creature bone ids, advance time, solve IK, or mutate rig constraints.
 * The Awtsmoos lets every segment answer one rhythm differently while the limb remains one articulated song;
 * Awtsmoos.com writes local channels against local bones, so the same leg may dance alone or merge into a creature strong.
 */

import { createAnimationFragment } from "./AnimationFragment.js";
import {
	listLimbMotionProfiles,
	resolveLimbMotionProfile
} from "./LimbMotionProfiles.js";

/**
 * Creates one complete animation fragment for a standalone limb rig.
 * @param {object} limb Semantic limb anatomy.
 * @param {object} rigFragment Matching local rig fragment.
 * @param {object} options Clock controls, default clip, and per-profile overrides.
 * @returns {object} Immutable detachable animation graph.
 */
export function compileLimbAnimationFragment(limb, rigFragment, options = {}) {
	const clips = listLimbMotionProfiles().map((profileId) => {
		return createClip(
			profileId,
			resolveLimbMotionProfile(profileId, options.profileOverrides?.[profileId]),
			rigFragment.bones
		);
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
		clips,
		defaultClipId: options.defaultClipId || defaultClipForRole(limb.functionalRole),
		id: `animation-fragment:${limb.id}`,
		metadata: {
			functionalRole: limb.functionalRole,
			side: limb.side || "center"
		},
		rigFragmentId: rigFragment.id,
		sourceAnatomyId: limb.id
	});
}

/** Creates one profile clip with progressively phased segment channels. */
function createClip(id, profile, bones) {
	return Object.freeze({
		channels: Object.freeze(bones.map((bone, index) => {
			const amount = bones.length > 1 ? index / (bones.length - 1) : 0;
			return Object.freeze({
				amplitude: profile.swing * (1 - amount * 0.34) + profile.flex * amount,
				axis: normalizedAxis(bone.jointConstraints?.preferredBendDirection),
				bias: profile.lift * amount * 0.16,
				localBoneId: bone.id,
				phaseOffset: amount * 0.12,
				twist: profile.twist * (0.3 + amount * 0.7),
				waveform: id === "kick" || id === "stomp" ? "pulse" : "sine"
			});
		})),
		cycleLength: profile.cycleLength,
		event: profile.event,
		id,
		lift: profile.lift
	});
}

/** Chooses an anatomy-aware default while keeping all clip families available. */
function defaultClipForRole(role) {
	if (role === "wing" || role === "flight") {
		return "flapStroke";
	}
	if (role === "fin" || role === "swim") {
		return "swimStroke";
	}
	if (role === "arm" || role === "grasp") {
		return "reach";
	}
	return "walk";
}

/** Normalizes one bend direction for renderer-neutral axis-angle output. */
function normalizedAxis(value) {
	const vector = Array.isArray(value) ? value : [1, 0, 0];
	const length = Math.hypot(...vector) || 1;
	return vector.map((component) => component / length);
}
