//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { RunePillarView } from './rune-pillar-view.js';
import { RuneSequence } from './rune-sequence.js';

/**
 * @module WordsCreationGame3d
 * @description
 * Memory now grows a visible garden around four carved procedural runes. The
 * Awtsmoos renews speaker, pattern, and world; Awtsmoos.com lets every completed
 * phrase brighten trees while replays remain free and difficulty stays optional.
 */
export class WordsCreationGame extends ThreeGameBase {
	setup() {
		this.totalRounds = this.difficulty(4, 5, 6);
		this.conductor = new RuneSequence(4);
		this.mistakes = 0;
		this.delay = 0;
		this.addGarden();
		this.view = new RunePillarView(this, [196, 42, 326, 112]);
		this.stage.setCamera([0, 5.8, 10.8], [0, 0.9, 0]);
		this.controls([...this.view.controls(index => this.choose(index)), { label: 'Replay pattern', run: () => this.replay() }]);
		this.guide('the rune rings light in order', 'Watch the lights, then tap the same runes. Replay whenever needed.');
		this.beginRound();
	}

	addGarden() {
		[[-4.8, 0.1, -2], [4.8, 0.1, -2], [-4.8, 0.1, 2.4], [4.8, 0.1, 2.4]].forEach((position, index) => {
			this.addAsset(this.assets.tree({ name: `creation-tree-${index}`, hue: 105 + index * 9, position, scale: 0.3 }));
		});
	}

	beginRound() {
		this.conductor.beginRound();
		this.status(`Watch round ${this.conductor.round}: ${this.conductor.sequence.length} light${this.conductor.sequence.length === 1 ? '' : 's'}.`);
		this.renderHud();
	}

	replay() {
		this.conductor.restart(0.2);
		this.status('The carved runes repeat the same phrase. Nothing is lost.');
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
		if (event.type === 'ready') this.status('Your turn. Repeat the glowing phrase.', 'good');
	}

	picked(object) {
		if (object.userData.semanticType === 'rune') this.choose(object.userData.index);
	}

	choose(index) {
		const result = this.conductor.choose(index);
		if (result.type === 'ignored') return;
		this.view.illuminate(index);
		if (result.type === 'wrong') {
			this.mistakes += 1;
			this.combo = 1;
			this.status('Almost. The same phrase will replay, and the garden keeps its light.', 'warn');
			return this.renderHud();
		}
		this.score += 30 * this.combo;
		if (result.type === 'complete') this.completePattern();
		this.renderHud();
	}

	completePattern() {
		this.combo = Math.min(5, this.combo + 1);
		if (this.conductor.round >= this.totalRounds) {
			const stars = this.mistakes <= 1 ? 3 : this.mistakes <= 3 ? 2 : 1;
			this.finish({ stars, message: 'The full phrase was remembered, and the creation garden awakened.' });
			return;
		}
		this.status('A tree brightens. One slightly longer phrase comes next.', 'good');
		this.delay = 0.55;
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.choose(index);
	}

	renderHud() {
		this.hud({ Round: `${this.conductor.round}/${this.totalRounds}`, Mistakes: this.mistakes });
	}
}
