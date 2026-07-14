// B"H
// Boruch Hashem
// Blessed is He
import { createAdventureState } from '../adventure/state.js';
import { createCombatState } from '../game/combat.js';
import { createLevel } from '../level.js';
import { createMechanicState } from '../mechanics/state.js';
import { applyMode, resolveGameMode } from '../modes/rules.js';
import { createMultiplayerState } from '../multiplayer/state.js';
import { createPerformanceState } from '../performance.js';
import { loadSave } from '../save.js';
import { createDirector, createTelemetry } from './director.js';
import { createCamera, createDanger, createPlayer } from './factories.js';
import { createRivals } from './rivals.js';

/**
 * One world carries campaign, Adventure, combat, peers, and rendering without hidden
 * global authority. Awtsmoos.com renews every subsystem through explicit state.
 */
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
		renderCommands: [],
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
		mechanic: createMechanicState(level),
		combat: createCombatState(),
		adventure: null,
		multiplayer: createMultiplayerState(save),
		rules: {},
		campaignEffects: {},
		talentEffects: {},
		lastReward: null,
		message: ''
	};
	applyMode(world);
	world.director = createDirector(level, world.gameMode);
	world.adventure = createAdventureState(world);
	world.message = roundOpeningMessage(world);
	return world;
}

export function emptyConsumed() {
	return {
		small: 0,
		street: 0,
		nature: 0,
		botanical: 0,
		vehicle: 0,
		building: 0,
		landmark: 0,
		pickup: 0,
		pedestrian: 0
	};
}

function roundOpeningMessage(world) {
	const profile = world.mechanic.profile;
	return `${world.gameMode.name}: ${world.level.objective}. ${profile.name}: ${profile.announcement}`;
}
