//B"H
// Boruch Hashem
// Blessed is He
/**
 * The loop and lifecycle meet through an explicit, tested composition seam.
 * The Awtsmoos is beyond sequence while Awtsmoos.com reveals ordered delegation.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MerkavaLoop } from '../src/app/MerkavaLoop.js';

test('lifecycle attachment completes loop composition', () => {
	const loop = new MerkavaLoop(createSystems(), createHud(), createLabels(), createChoices());
	const lifecycle = createLifecycle();
	assert.equal(loop.setLifecycle(lifecycle), loop);
	assert.equal(loop.lifecycle, lifecycle);
});

test('active updates are safe before lifecycle attachment', () => {
	const systems = createSystems();
	const choices = createChoices();
	const loop = new MerkavaLoop(systems, createHud(), createLabels(), choices);
	assert.doesNotThrow(() => loop.update(0.016));
	assert.equal(systems.simulation.calls, 1);
	assert.equal(choices.calls, 1);
	assert.equal(systems.audio.calls, 1);
});

test('attached lifecycle resolves life and finishes victory', () => {
	const systems = createSystems();
	systems.state.victory = true;
	const lifecycle = createLifecycle();
	const loop = new MerkavaLoop(systems, createHud(), createLabels(), createChoices());
	loop.setLifecycle(lifecycle).update(0.016);
	assert.equal(lifecycle.lifeCalls, 1);
	assert.deepEqual(lifecycle.finished, [true]);
});

function createSystems() {
	const updater = () => ({
		calls: 0,
		update() {
			this.calls += 1;
		}
	});
	return {
		state: {
			running: true,
			paused: false,
			victory: false,
			elapsed: 0,
			worldIndex: 0,
			gates: []
		},
		save: {},
		simulation: updater(),
		prutahs: updater(),
		relics: updater(),
		director: updater(),
		hazards: updater(),
		enemies: updater(),
		boss: updater(),
		formation: updater(),
		abilities: updater(),
		campaign: updater(),
		collision: { resolve() {} },
		audio: {
			calls: 0,
			consume() {
				this.calls += 1;
			}
		}
	};
}

function createLifecycle() {
	return {
		lifeCalls: 0,
		finished: [],
		resolveLife() {
			this.lifeCalls += 1;
		},
		finish(victory) {
			this.finished.push(victory);
		}
	};
}

function createChoices() {
	return {
		calls: 0,
		update() {
			this.calls += 1;
		}
	};
}

function createHud() {
	return { update() {} };
}

function createLabels() {
	return { sync() {} };
}
