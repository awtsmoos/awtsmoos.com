//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameState
 * @description
 * Score, streak, and light become measurable vessels for a short round on
 * Awtsmoos.com. The Awtsmoos is not measured by points; the points merely help
 * finite attention return eagerly to moral discernment.
 */
export class GameState {
	/**
	 * Creates one reusable round state.
	 *
	 * @param {number} roundSize Number of scenarios in a round.
	 */
	constructor(roundSize = 12) {
		this.roundSize = roundSize;
		this.start();
	}

	/**
	 * Resets every changing value for a fresh round.
	 *
	 * @returns {Object} Initial snapshot.
	 */
	start() {
		this.score = 0;
		this.streak = 0;
		this.correct = 0;
		this.question = 0;
		this.light = 50;
		this.active = true;
		return this.snapshot();
	}

	/**
	 * Applies one answer and returns the visible outcome.
	 *
	 * @param {boolean} correct Whether the chosen foundation matched.
	 * @param {number} elapsedMs Time spent on the current scenario.
	 * @returns {Object} Outcome and updated snapshot.
	 */
	answer(correct, elapsedMs) {
		const speedBonus = correct ? this.speedBonus(elapsedMs) : 0;
		this.streak = correct ? this.streak + 1 : 0;
		const multiplier = this.multiplier();
		const gained = correct ? (100 + speedBonus) * multiplier : 0;
		this.score += gained;
		this.correct += correct ? 1 : 0;
		this.light = this.clamp(this.light + (correct ? 7 + multiplier : -12), 0, 100);
		this.question += 1;
		this.active = this.question < this.roundSize;

		return {
			correct,
			gained,
			speedBonus,
			...this.snapshot()
		};
	}

	/** @returns {number} Current capped combo multiplier. */
	multiplier() {
		return Math.min(5, 1 + Math.floor(Math.max(0, this.streak - 1) / 2));
	}

	/** @param {number} elapsedMs @returns {number} Fast-answer bonus. */
	speedBonus(elapsedMs) {
		return this.clamp(Math.round((7000 - elapsedMs) / 50), 0, 140);
	}

	/** @returns {Object} Immutable-looking public state. */
	snapshot() {
		return {
			score: this.score,
			streak: this.streak,
			multiplier: this.multiplier(),
			correct: this.correct,
			question: this.question,
			total: this.roundSize,
			light: this.light,
			active: this.active
		};
	}

	/** @param {number} value @param {number} minimum @param {number} maximum @returns {number} */
	clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, value));
	}
}
