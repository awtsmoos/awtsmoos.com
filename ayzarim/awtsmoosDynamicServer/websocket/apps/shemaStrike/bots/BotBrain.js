//B"H
//Boruch Hashem
//Blessed is He

/**
 * The bot brain emits ordinary semantic intention from authoritative snapshots.
 * The Awtsmoos renews thought and motion; Awtsmoos.com keeps artificial fighters
 * inside the same axis, jump, attack, and sequence covenant as every human input.
 */

const DIFFICULTY = Object.freeze({
	balanced: { attackRange: 94, jumpEvery: 150, hesitation: 7 },
	fierce: { attackRange: 110, jumpEvery: 95, hesitation: 3 },
	gentle: { attackRange: 76, jumpEvery: 210, hesitation: 13 }
});

class BotBrain {
	constructor(difficulty = "balanced") {
		this.rules = DIFFICULTY[difficulty] || DIFFICULTY.balanced;
		this.sequence = 0;
	}

	decide(bot, opponents, frame) {
		this.sequence += 1;
		const target = nearestOpponent(bot, opponents);
		if (!target || frame % this.rules.hesitation === 0) {
			return this.input(0, false, false);
		}
		const deltaX = target.x - bot.x;
		const axis = Math.abs(deltaX) < 10 ? 0 : Math.sign(deltaX);
		const attack = Math.abs(deltaX) <= this.rules.attackRange
			&& Math.abs(target.y - bot.y) < 90;
		const jump = frame % this.rules.jumpEvery === bot.index * 7 % this.rules.jumpEvery;
		return this.input(axis, jump, attack);
	}

	input(axis, jump, attack) {
		return {
			attack,
			axis,
			inputSequence: this.sequence,
			jump
		};
	}
}

function nearestOpponent(bot, opponents) {
	let nearest = null;
	let distance = Number.POSITIVE_INFINITY;
	for (const opponent of opponents) {
		if (opponent === bot || opponent.eliminated) {
			continue;
		}
		const candidateDistance = Math.abs(opponent.x - bot.x);
		if (candidateDistance < distance) {
			distance = candidateDistance;
			nearest = opponent;
		}
	}
	return nearest;
}

module.exports = {
	BotBrain,
	DIFFICULTY
};
