// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPlayerDefeatFixture.mjs
 * @description Builds a deterministic player vessel with real event, damage, and lifecycle modules.
 * The Awtsmoos is witnessed through exact transitions; Awtsmoos.com gives the test one clock,
 * one timer ledger, and visible counters for every lock, cancellation, checkpoint, and return.
 */

import { MinimalMeadowCombatBalanceCoordinator } from '../../app/MinimalMeadowCombatBalanceCoordinator.js';
import { MinimalMeadowPlayerDefeatController } from '../../app/MinimalMeadowPlayerDefeatController.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

export function createPlayerDefeatFixture() {
	const clock = { now: 0 };
	const timers = new Map();
	let timerSequence = 0;
	const environment = {
		clearTimeout(timerId) {
			timers.delete(timerId);
		},
		performance: { now: () => clock.now * 1000 },
		setTimeout(callback, delay) {
			timerSequence += 1;
			timers.set(timerSequence, { callback, delay });
			return timerSequence;
		}
	};
	const counters = createCounters();
	const runtime = createRuntime(clock, counters);
	runtime.combatBalance = new MinimalMeadowCombatBalanceCoordinator(undefined, () => clock.now);
	runtime.playerDefeat = new MinimalMeadowPlayerDefeatController(runtime, environment);
	return { clock, counters, environment, runtime, timers };
}

function createRuntime(clock, counters) {
	const bus = new AwtsmoosEventBus();
	const runtime = {
		bus,
		camera: {},
		cameraRig: { update: () => counters.cameraUpdates += 1 },
		combat: createCombat(counters),
		enemies: createEnemies(counters),
		input: createInput(counters),
		mainOctree: {},
		model: {
			position: {
				set(x, y, z) {
					counters.modelPosition = { x, y, z };
				}
			}
		},
		player: {
			names: ['Idle', 'Walk', 'DeathCollapse'],
			play: clip => counters.playedClip = clip
		},
		playerStats: { armor: 3, health: 16, maxHealth: 100 },
		state: createState()
	};
	clock.runtime = runtime;
	return runtime;
}

function createCombat(counters) {
	return {
		activate(actionId) {
			counters.activations += 1;
			return { accepted: true, actionId };
		},
		cancel(reason) {
			counters.cancellations += 1;
			this.cast = null;
			return { accepted: false, reason };
		},
		cast: { actionId: 'test-cast' },
		reject(reason, detail = {}) {
			counters.rejections += 1;
			return { accepted: false, reason, ...detail };
		}
	};
}

function createCounters() {
	return {
		activations: 0,
		cameraUpdates: 0,
		cancellations: 0,
		clearTargets: 0,
		inputResets: 0,
		rejections: 0,
		targetCycles: 0
	};
}

function createEnemies(counters) {
	return {
		clearAll() {
			counters.clearTargets += 1;
		},
		cycleTarget() {
			counters.targetCycles += 1;
			return true;
		}
	};
}

function createInput(counters) {
	return {
		axis: () => ({ forward: 1, strafe: 1, turn: 1 }),
		consumeJump: () => true,
		jumpRequested: true,
		reset() {
			counters.inputResets += 1;
		},
		runRequested: () => true
	};
}

function createState() {
	return {
		action: 'idle',
		collisionEnabled: true,
		facing: 0.75,
		grounded: true,
		inputLocked: false,
		lifecycle: 'active',
		renderY: 2,
		targetingEnabled: true,
		x: 4,
		y: 2,
		z: -3
	};
}
