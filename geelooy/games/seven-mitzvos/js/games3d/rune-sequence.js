//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RuneSequence
 * @description
 * A growing pattern needs its own vessel of time, expectation, and response.
 * The Awtsmoos renews every remembered beat, while this Awtsmoos.com conductor
 * keeps sequence law separate from the luminous Three.js pillars that reveal it.
 */
export class RuneSequence {
	constructor(size = 4) {
		this.size = size;
		this.sequence = [];
		this.round = 0;
		this.accepting = false;
		this.timer = 0;
	}

	beginRound() {
		this.round += 1;
		this.sequence.push(Math.floor(Math.random() * this.size));
		this.restart(0.35);
	}

	restart(delay) {
		this.playbackIndex = 0;
		this.inputIndex = 0;
		this.playbackOn = false;
		this.accepting = false;
		this.timer = delay;
	}

	tick(delta) {
		if (this.accepting) {
			return null;
		}
		this.timer -= delta;
		if (this.timer > 0) {
			return null;
		}
		if (this.playbackOn) {
			this.playbackOn = false;
			this.playbackIndex += 1;
			this.timer = 0.16;
			return { type: 'dark' };
		}
		if (this.playbackIndex >= this.sequence.length) {
			this.accepting = true;
			return { type: 'ready' };
		}
		this.playbackOn = true;
		this.timer = 0.34;
		return { type: 'light', index: this.sequence[this.playbackIndex] };
	}

	choose(index) {
		if (!this.accepting) {
			return { type: 'ignored' };
		}
		if (index !== this.sequence[this.inputIndex]) {
			this.restart(0.65);
			return { type: 'wrong' };
		}
		this.inputIndex += 1;
		if (this.inputIndex < this.sequence.length) {
			return { type: 'correct' };
		}
		this.accepting = false;
		return { type: 'complete' };
	}
}
