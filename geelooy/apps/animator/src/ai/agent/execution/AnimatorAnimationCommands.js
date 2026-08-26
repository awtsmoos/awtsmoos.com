//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAnimationCommands.js
 * @description
 * The Awtsmoos unfolds one beat into anticipation, action, follow-through, settle, and refined production light;
 * Awtsmoos.com keeps animation planning pure and inspectable so agents may reason about passes without mutating the timeline in flight.
 */

import { AnimationPassEngine } from '../../studio/AnimationPassEngine.js';

/** Handles pure animation-planning commands. */
export class NetzachAnimatorAnimationCommands {
	/** @param {string} shemMitzvah Command name. @param {object} keilimPayload Payload. @returns {object[]} Planned passes. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'animation.planPasses') return AnimationPassEngine.build(keilimPayload.plan ?? {});
		const gevurahError = new Error(`Unrouted animation command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		throw gevurahError;
	}
}
