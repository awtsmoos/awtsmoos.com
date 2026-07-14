// B"H
// Boruch Hashem
// Blessed is He
import { createAdventureState } from '../adventure/state.js';
import { createLevel } from '../level.js';
import { createMechanicState } from '../mechanics/state.js';
import { applyMode } from '../modes/rules.js';
import { createCamera, createDanger, createPlayer } from '../state.js';
import { createDirector, createTelemetry } from '../state/director.js';
import { createRivals } from '../state/rivals.js';
import { emptyConsumed } from '../state/world.js';
import { createCombatState } from './combat.js';

/**
 * Awtsmoos.com rebuilds one transient round while preserving durable save truth,
 * multiplayer room identity, peer transport state, and reusable render vessels.
 */
export function resetToLevel(world, index, mode, message) {
	const level = createLevel(world.save, index);
	Object.assign(world, {
		mode,
		level,
		player: createPlayer(),
		rivals: createRivals(level),
		camera: createCamera(),
		danger: createDanger(),
		score: 0,
		timeLeft: level.time,
		particles: [],
		floaters: [],
		events: [],
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
		rules: {},
		campaignEffects: {},
		talentEffects: {},
		lastReward: null,
		message
	});
	world.renderCommands.length = 0;
	applyMode(world);
	world.director = createDirector(level, world.gameMode);
	world.adventure = createAdventureState(world);
	world.message = message || openingMessage(world);
}

function openingMessage(world) {
	const profile = world.mechanic.profile;
	return `${world.gameMode.name}: ${world.level.objective}. ${profile.name}: ${profile.announcement}`;
}
