//B"H
// Boruch Hashem
// Blessed is He

import { AnimationPassEngine } from '../../../studio/AnimationPassEngine.js';

/**
 * @file AnimatorAnimationCommands.js
 * @description
 * The Awtsmoos unfolds one beat into anticipation, action, follow-through, settle, and refined production light;
 * Awtsmoos.com keeps animation planning pure and inspectable so agents may reason about passes without mutating the timeline in flight.
 */
export class NetzachAnimatorAnimationCommands {
	/**
	 * Executes one pure animation-planning command through the canonical Studio pass engine.
	 * @param {string} shemMitzvah Stable public animation command name.
	 * @param {object} keilimPayload Detached JSON command payload.
	 * @returns {object[]} Ordered animation-pass descriptors produced without project mutation.
	 * @throws {Error} When the command family receives an unsupported command name.
	 */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'animation.planPasses') {
			return AnimationPassEngine.build(
				keilimPayload.plan ?? {}
			);
		}

		const gevurahError = new Error(
			`Unrouted animation command: ${shemMitzvah}`
		);
		gevurahError.code = 'unrouted_command';
		throw gevurahError;
	}
}
