//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WordsOfCreationState
 * @description
 * A growing sequence becomes a finite vessel for attentive speech on
 * Awtsmoos.com. The Awtsmoos holds every instant together; the player learns
 * to hold each letter in order before releasing the next.
 */
export class WordsState {
	constructor(random, rounds = 8) {
		this.random = random;
		this.totalRounds = rounds;
		this.sequence = [];
		this.round = 0;
		this.inputIndex = 0;
		this.lives = 3;
		this.score = 0;
		this.streak = 0;
		this.phase = 'ready';
		this.ended = false;
		this.won = false;
	}

	beginRound() {
		if (this.ended) {
			return [];
		}
		this.round += 1;
		this.sequence.push(Math.floor(this.random() * 4));
		this.inputIndex = 0;
		this.phase = 'watch';
		return [...this.sequence];
	}

	replay() {
		this.inputIndex = 0;
		this.phase = 'watch';
		return [...this.sequence];
	}

	accept(index) {
		if (this.phase !== 'input' || this.ended) {
			return { accepted: false, message: 'Watch the complete sequence first.' };
		}
		if (index !== this.sequence[this.inputIndex]) {
			this.lives -= 1;
			this.streak = 0;
			this.phase = this.lives > 0 ? 'watch' : 'ended';
			this.ended = this.lives <= 0;
			return { accepted: false, mistake: true, message: this.ended ? 'The sequence dissolved.' : 'The pattern broke. Watch it again.' };
		}
		this.inputIndex += 1;
		this.streak += 1;
		this.score += 20 * Math.max(1, this.streak);
		if (this.inputIndex < this.sequence.length) {
			return { accepted: true, complete: false, message: 'Correct. Continue.' };
		}
		this.score += 100 * this.round;
		this.won = this.round >= this.totalRounds;
		this.ended = this.won;
		this.phase = this.won ? 'ended' : 'ready';
		return { accepted: true, complete: true, won: this.won, message: this.won ? 'The full chain stands in order.' : 'Sequence complete.' };
	}

	allowInput() {
		this.phase = 'input';
	}

	snapshot() {
		return { sequence: [...this.sequence], round: this.round, totalRounds: this.totalRounds, inputIndex: this.inputIndex, lives: this.lives, score: this.score, streak: this.streak, phase: this.phase, ended: this.ended, won: this.won };
	}
}
