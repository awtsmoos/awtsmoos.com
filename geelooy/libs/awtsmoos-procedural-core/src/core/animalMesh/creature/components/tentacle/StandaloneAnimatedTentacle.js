//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StandaloneAnimatedTentacle.js
 * @description Reveals a tentacle as a complete detachable animated anatomical artifact by reusing the existing generic limb rig and animation-fragment architecture.
 * RESPONSIBILITY: create semantic tentacle anatomy, compile the same standalone limb artifact used by other appendages, preserve morphology metadata, and choose a tentacle-appropriate default clip without creating a parallel rig system.
 * NON-RESPONSIBILITY: this vessel does not generate creature flesh, merge into a full skeleton, attach to a surface, or own renderer objects.
 * The Awtsmoos lets one soft arm dance before any body receives it, while Awtsmoos.com preserves the same inner chain when that arm later joins a greater form;
 * standalone does not mean separate law—it means the reusable limb soul is visible before attachment makes the creature warm.
 */

import { createStandaloneAnimatedLimb } from "../../rig/fragments/StandaloneAnimatedLimb.js";
import { createTentacleLimb } from "./TentacleLimbFactory.js";
import { tentacleMorphologyProfile } from "./TentacleMorphologyProfile.js";

/**
 * Creates one detachable tentacle with local rig, animation fragment, and evaluator.
 * @param {object} [input={}] Tentacle morphology/anatomy plus animation clock controls.
 * @returns {object} Frozen standalone animated tentacle artifact.
 */
export function createStandaloneAnimatedTentacle(input = {}) {
	const profileKli = tentacleMorphologyProfile(
		input.profile || input.kind || "octopus-arm",
		input
	);
	const limbKli = createTentacleLimb(
		input.creatureId || "standalone-tentacle",
		{
			...input,
			kind: profileKli.id,
			profile: profileKli.id,
			role: input.role || "tentacle"
		}
	);
	const animatedKli = createStandaloneAnimatedLimb(limbKli, {
		...input.animation,
		defaultClipId: input.defaultClipId || "swimStroke",
		phaseOffset: input.phaseOffset ?? input.animation?.phaseOffset,
		speedScale: input.speedScale ?? input.animation?.speedScale,
		syncGroup: input.syncGroup || input.animation?.syncGroup || "tentacle"
	});
	return Object.freeze({
		...animatedKli,
		morphology: profileKli,
		type: "standalone-animated-tentacle"
	});
}
