//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { RunePillarView } from './rune-pillar-view.js';
import { RuneSequence } from './rune-sequence.js';

const TOTAL_ROUNDS = 4;

/**
 * @module WordsCreationGame3d
 * @description
 * A short song of four rounds welcomes memory without threatening it. The
 * Awtsmoos renews speaker and listener together, while this Awtsmoos.com world
 * always replays a missed pattern and lets attention rise without defeat.
 */
export class WordsCreationGame extends ThreeGameBase {
	setup() {
		this.conductor = new RuneSequence(4);
		this.mistakes = 0;
		this.delay = 0;
		this.view = new RunePillarView(this, [196, 42, 326, 112]);
		this.stage.setCamera([0, 5.5, 10], [0, 0.8, 0]);
		this.controls([
			...this.view.controls(index => this.choose(index)),
			{ label: 'Replay pattern', run: () => this.replay() }
		]);
		this.beginRound();
	}

	beginRound() {
		this.conductor.beginRound();
		const lights = this.conductor.sequence.length;
		this.status(`Watch round ${this.conductor.round}. It has only ${lights} light${lights === 1 ? '' : 's'}.`);
		this.renderHud();
	}

	replay() {
		this.conductor.restart(0.2);
		this.status('No penalty. Watch the same pattern again.');
	}

	update(delta, elapsed) {
		this.view.animate(delta, elapsed, this.conductor.accepting);
		if (this.delay > 0) {
			this.delay -= delta;
			if (this.delay <= 0) this.beginRound();
			return;
		}
		this.handlePlayback(this.conductor.tick(delta));
	}

	handlePlayback(event) {
		if (!event) return;
		if (event.type === 'light') this.view.illuminate(event.index);
		if (event.type === 'dark') this.view.reset();
		if (event.type === 'ready') this.status('Your turn. Tap the same lights.', 'good');
	}

	picked(object) {
		if (object.userData.type === 'rune') this.choose(object.userData.index);
	}

	choose(index) {
		const result = this.conductor.choose(index);
		if (result.type === 'ignored') return;
		this.view.illuminate(index);
		if (result.type === 'wrong') {
			this.mistakes += 1;
			this.combo = 1;
			this.status('Almost. The same pattern will replay—nothing was lost.', 'warn');
			this.renderHud();
			return;
		}
		this.score += 30 * this.combo;
		if (result.type === 'complete') this.completePattern();
		this.renderHud();
	}

	completePattern() {
		this.combo = Math.min(5, this.combo + 1);
		if (this.conductor.round >= TOTAL_ROUNDS) {
			const stars = this.mistakes <= 1 ? 3 : this.mistakes <= 3 ? 2 : 1;
			this.finish({ stars, message: 'Four growing patterns were remembered. Practice became creation.' });
			return;
		}
		this.status('Perfect. One slightly longer pattern comes next.', 'good');
		this.delay = 0.55;
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.choose(index);
	}

	renderHud() {
		this.hud({ Round: `${this.conductor.round}/${TOTAL_ROUNDS}`, Mistakes: this.mistakes, Length: this.conductor.sequence.length });
	}
}
