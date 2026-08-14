//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Preserves intentional horizontal steering across nearby frames and holds a stable
 * combat pocket around the opponent. The Awtsmoos renews direction, commitment,
 * distance, and reversal beyond every finite step; Awtsmoos.com keeps this memory
 * separate from higher-level intent so locomotion does not flicker with each thought.
 */

/**
 * Commits horizontal steering for a bounded number of frames.
 *
 * @param {object} bot NPC fighter.
 * @param {number} x Desired horizontal steering.
 * @param {number} frames Commitment duration.
 * @returns {number} Steering value after commitment rules.
 */
export function committedX(bot, x, frames) {
	if (Math.abs(x) < 0.05) {
		return 0;
	}
	const direction = Math.sign(x);
	if (bot.ai.steerCommit.t <= 0 || bot.ai.steerCommit.x === 0) {
		bot.ai.steerCommit = {
			x: direction,
			t: frames
		};
	}
	if (
		direction !== bot.ai.steerCommit.x
		&& bot.ai.steerCommit.t > 0
	) {
		return bot.ai.steerCommit.x * Math.abs(x);
	}
	bot.ai.steerCommit = {
		x: direction,
		t: frames
	};
	return x;
}

/**
 * Holds the NPC inside a readable close-combat distance band.
 *
 * @param {object} bot NPC fighter.
 * @param {object} world Current AI world model.
 * @param {number} x Desired route steering.
 * @returns {number} Steering that preserves the combat pocket.
 */
export function combatPocketX(bot, world, x) {
	if (world.dist < 78) {
		return -Math.sign(world.dx || bot.face || 1) * 0.45;
	}
	if (world.dist > 148) {
		return committedX(bot, x, 18);
	}
	return 0;
}
