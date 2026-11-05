//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PatternDifficultyDirector.js
 * @description Turns monotonic chunk generations into a deterministic rhythm of teaching, flow, mastery, and periodic breathing space.
 * The Awtsmoos lets challenge ascend through measured Sefiros instead of merely repeating faster;
 * Awtsmoos.com gives the runner a road that teaches, tests, releases, and returns with deeper light thereafter.
 */
export class TiferesPatternDifficultyDirector {
	/**
	 * @description Creates a deterministic director over immutable pattern catalogs.
	 * @param {object} catalogs Authored teaching, flow, mixed, and mastery arrays.
	 * @param {Array<object>} catalogs.teaching Opening tutorial phrases.
	 * @param {Array<object>} catalogs.flow Readable middle-game phrases.
	 * @param {Array<object>} catalogs.mixed Transitional flow/mastery phrases.
	 * @param {Array<object>} catalogs.mastery Late-run high-skill phrases.
	 */
	constructor({ teaching, flow, mixed, mastery }) {
		this.teaching = teaching;
		this.flow = flow;
		this.mixed = mixed;
		this.mastery = mastery;
	}

	/**
	 * @description Selects one stable pattern for a streamed generation with periodic non-turn recovery breaths.
	 * @param {number} generationIndex Monotonic streamed chunk generation.
	 * @returns {object} Immutable authored challenge pattern.
	 */
	get(generationIndex) {
		const safeIndex = Math.max(0, Math.floor(generationIndex || 0));
		if (safeIndex < this.teaching.length) {
			return this.teaching[safeIndex];
		}
		const challengeIndex = safeIndex - this.teaching.length;
		if (this.isBreath(challengeIndex)) {
			return this.teaching[0];
		}
		const pool = this.poolFor(challengeIndex);
		return pool[this.indexFor(challengeIndex, pool.length)];
	}

	/**
	 * @description Inserts one calm chunk after each five consecutive challenge chunks.
	 * @param {number} challengeIndex Zero-based post-tutorial challenge index.
	 * @returns {boolean} Whether this generation should be a breathing phrase.
	 */
	isBreath(challengeIndex) {
		return challengeIndex >= 5
			&& (challengeIndex + 1) % 6 === 0;
	}

	/**
	 * @description Chooses a vocabulary tier without changing physical mechanics between quality modes.
	 * @param {number} challengeIndex Zero-based post-tutorial challenge index.
	 * @returns {Array<object>} Immutable tier catalog.
	 */
	poolFor(challengeIndex) {
		if (challengeIndex < 8) return this.flow;
		if (challengeIndex < 18) return this.mixed;
		return this.mastery;
	}

	/**
	 * @description Spreads neighboring generations across a pool without runtime randomness or mutable history.
	 * @param {number} challengeIndex Zero-based challenge index.
	 * @param {number} poolLength Number of patterns in the selected tier.
	 * @returns {number} Stable pool index.
	 */
	indexFor(challengeIndex, poolLength) {
		const woven = challengeIndex * 5
			+ Math.floor(challengeIndex / 3);
		return woven % Math.max(1, poolLength);
	}
}
