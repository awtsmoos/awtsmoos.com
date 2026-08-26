// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StandaloneAnimatedLimb.js
 * @description Creates a first-class detachable limb artifact containing its own local skeleton, controls, sockets, animation graph, and evaluator.
 * RESPONSIBILITY: make one leg, arm, wing, fin, or tentacle independently rigged and animatable before any creature body exists.
 * NON-RESPONSIBILITY: this file does not create flesh geometry, attach to a torso, merge final bone ids, or impose one motion profile.
 * The Awtsmoos lets one limb become a complete little world of bone, control, rhythm, and reach;
 * Awtsmoos.com gives the detached part a living contract, so embodiment later becomes composition instead of a special-case breach.
 */

import { evaluateAnimationFragment } from "../../motion/fragments/AnimationFragmentEvaluator.js";
import { compileLimbAnimationFragment } from "../../motion/fragments/LimbAnimationFragmentCompiler.js";
import { compileLimbRigFragment } from "./LimbRigFragmentCompiler.js";

/**
 * Creates one detached animated limb bundle with stable local rig and animation identities.
 * @param {object} limb Semantic limb anatomy.
 * @param {object} [options={}] Rig origin plus animation clock/default-clip controls.
 * @returns {object} Frozen standalone animated-limb artifact.
 */
export function createStandaloneAnimatedLimb(limb, options = {}) {
	const rigFragment = compileLimbRigFragment(limb, {
		fragmentId: options.fragmentId,
		origin: options.origin
	});
	const animationFragment = compileLimbAnimationFragment(
		limb,
		rigFragment,
		options.animation || options
	);
	return Object.freeze({
		animationFragment,
		id: String(options.id || `standalone-limb:${limb.id}`),
		limb,
		rigFragment,
		type: "standalone-animated-limb",
		version: "1.0.0",
		evaluate(time = 0, input = {}) {
			return evaluateAnimationFragment(
				animationFragment,
				time,
				input
			);
		}
	});
}
