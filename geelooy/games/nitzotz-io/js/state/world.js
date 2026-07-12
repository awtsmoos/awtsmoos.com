// B"H
import { createLevel } from '../level.js';
import { applyMode, resolveGameMode } from '../modes/rules.js';
import { createPerformanceState } from '../performance.js';
import { loadSave } from '../save.js';
import { createDirector, createTelemetry } from './director.js';
import { createCamera, createDanger, createPlayer } from './factories.js';
import { createRivals } from './rivals.js';

/** One world carries a persistent arena, selected mode, director, and telemetry. */
export function createWorld() {
	const save = loadSave();
	const levelIndex = Math.min(save.currentLevel || 0, save.unlocked || 0);
	const level = createLevel(save, levelIndex);
	const world = {
		mode: 'ready',
		save,
		level,
		gameMode: resolveGameMode(save.selectedMode),
		performance: createPerformanceState(),
		player: createPlayer(),
		rivals: createRivals(level),
		camera: createCamera(),
		danger: createDanger(),
		input: { x: 0, y: 0, pulse: 0 },
		particles: [],
		floaters: [],
		events: [],
		score: 0,
		timeLeft: level.time,
		consumed: emptyConsumed(),
		powerups: { magnet: 0, surge: 0 },
		districtChain: 0,
		lastDistrict: '',
		won: false,
		lost: false,
		objectiveMet: false,
		bonusMet: false,
		stars: 0,
		rank: 1,
		sefirah: level.index,
		telemetry: createTelemetry(),
		director: null,
		rules: {},
		message: ''
	};
	applyMode(world);
	world.director = createDirector(level, world.gameMode);
	world.message = `${world.gameMode.name}: ${level.objective}.`;
	return world;
}

export function emptyConsumed() {
	return {
		small: 0, street: 0, nature: 0, vehicle: 0, building: 0,
		landmark: 0, pickup: 0, pedestrian: 0
	};
}
