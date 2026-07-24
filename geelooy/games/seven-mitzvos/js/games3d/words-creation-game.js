//B"H
//Boruch Hashem
//Blessed is He
import { CreationGardenLife } from './creation-garden-life.js';
import { ThreeGameBase } from './game-base.js';
import { RunePillarView } from './rune-pillar-view.js';
import { RuneSequence } from './rune-sequence.js';
/**
 * Students and animals move with purpose while the Awtsmoos renews speaker, listener, and the growing Awtsmoos.com garden.
 */
export class WordsCreationGame extends ThreeGameBase {
	setup() {
		this.totalRounds = this.difficulty(4, 5, 6);
		this.conductor = new RuneSequence(4);
		this.mistakes = 0;
		this.delay = 0;
		this.addGarden();
		this.view = new RunePillarView(this, [196, 42, 326, 112]);
		this.life = new CreationGardenLife(this, this.view.runes);
		this.stage.setCamera([0, 5.8, 10.8], [0, 0.9, 0]);
		this.controls([
			...this.view.controls(index => this.choose(index)),
			{ label: 'Replay pattern', run: () => this.replay() }
		]);
		this.guide('students approach each glowing rune in order', 'Watch the lights, then tap the same runes. Replay whenever needed.');
		this.beginRound();
	}
	addGarden() {
		const positions = [[-4.8, -2], [4.8, -2], [-4.8, 2.4], [4.8, 2.4], [0, -5], [0, 4.8]];
		positions.forEach((point, index) => {
			this.addAsset(this.assets.tree({
				name: `creation-tree-${index}`, hue: 105 + index * 9,
				position: [point[0], 0.1, point[1]], scale: 0.28,
				role: 'creation-tree', reason: 'visibly grows around remembered ordered words'
			}));
		});
	}
	beginRound() {
		this.life.resume();
		this.conductor.beginRound();
		const length = this.conductor.sequence.length;
		this.status(`Watch round ${this.conductor.round}: ${length} light${length === 1 ? '' : 's'}.`);
		this.renderHud();
	}
	replay() {
		this.conductor.restart(0.2);
		this.status('Students return to the lesson. The same phrase repeats and nothing is lost.');
	}
	update(delta, elapsed) {
		this.view.animate(delta, elapsed, this.conductor.accepting);
		this.life.update(delta, elapsed);
		if (this.delay > 0) {
			this.delay -= delta;
			if (this.delay <= 0) {
				this.beginRound();
			}
			return;
		}
		this.handlePlayback(this.conductor.tick(delta));
	}
	handlePlayback(event) {
		if (!event) {
			return;
		}
		if (event.type === 'light') {
			this.view.illuminate(event.index);
			this.life.focus(event.index);
		}
		if (event.type === 'dark') {
			this.view.reset();
		}
		if (event.type === 'ready') {
			this.status('Your turn. Repeat the glowing phrase while the students watch.', 'good');
		}
	}
	picked(object) {
		if (object.userData.semanticType === 'rune') {
			this.choose(object.userData.index);
		}
	}
	choose(index) {
		const result = this.conductor.choose(index);
		if (result.type === 'ignored') {
			return;
		}
		this.view.illuminate(index);
		this.life.focus(index);
		if (result.type === 'wrong') {
			this.mistakes += 1;
			this.combo = 1;
			this.status('Almost. The same phrase will replay, and the garden keeps its light.', 'warn');
			return this.renderHud();
		}
		this.score += 30 * this.combo;
		if (result.type === 'complete') {
			this.completePattern();
		}
		this.renderHud();
	}
	completePattern() {
		this.combo = Math.min(5, this.combo + 1);
		if (this.conductor.round >= this.totalRounds) {
			const stars = this.mistakes <= 1 ? 3 : this.mistakes <= 3 ? 2 : 1;
			this.finish({ stars, message: 'Students remembered the full phrase, animals gathered, and the garden awakened.' });
			return;
		}
		this.status('The students celebrate as another tree brightens.', 'good');
		this.delay = 0.55;
	}
	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) {
			this.choose(index);
		}
	}
	renderHud() {
		this.hud({ Round: `${this.conductor.round}/${this.totalRounds}`, Mistakes: this.mistakes });
	}
}
