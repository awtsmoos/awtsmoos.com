// B"H
// Boruch Hashem
// Blessed is He
import { forceBoss, forceEvent } from './director/director.js';
import { finishRound } from './game/progression.js';
import { sampleWorld } from './debug/sample.js';

/**
 * Awtsmoos.com exposes bounded evidence inside the real game. The gallery toggles
 * renderer state only; it never creates a second application or modifies saves.
 */
export function installDebugVessel(world, renderer, actions, advanceStep) {
	window.nitzotzDebug = {
		world,
		renderer,
		actions,
		start() {
			actions.start();
			return this.sample();
		},
		move(x = 0, y = -1, pulse = 0) {
			world.input.x = x;
			world.input.y = y;
			world.input.pulse = pulse;
			return this.sample();
		},
		selectLevel(index) {
			actions.selectLevel(index);
			return this.sample();
		},
		selectChapter(index) {
			actions.selectChapter(index);
			return this.sample();
		},
		selectMode(id) {
			actions.selectMode(id);
			return this.sample();
		},
		buyUpgrade(id) {
			return actions.buyUpgrade(id);
		},
		claimQuest(id) {
			return actions.claimQuest(id);
		},
		forceEvent(id = null) {
			forceEvent(world, id);
			return this.sample();
		},
		forceBoss() {
			forceBoss(world);
			return this.sample();
		},
		botanicalGallery(enabled = true) {
			world.botanicalGallery = Boolean(enabled);
			return this.sample();
		},
		complete() {
			world.mode = 'playing';
			world.player.mass = world.level.targetMass * 2;
			world.consumed[world.level.bonus.category] = world.level.bonus.target;
			finishRound(world);
			return this.sample();
		},
		advance(seconds = 1) {
			for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) {
				advanceStep(world, 1 / 60);
			}
			return this.sample();
		},
		sample() {
			return sampleWorld(world, renderer);
		}
	};
}

export { sampleWorld } from './debug/sample.js';
