// B"H
// Boruch Hashem
// Blessed is He
import { createLevel } from '../level.js';
import { createMechanicState } from '../mechanics/state.js';
import { applyMode } from '../modes/rules.js';
import { createCamera, createDanger, createPlayer } from '../state.js';
import { createDirector, createTelemetry } from '../state/director.js';
import { createRivals } from '../state/rivals.js';
import { emptyConsumed } from '../state/world.js';

/**
 * Awtsmoos.com rebuilds the transient round while preserving durable campaign truth.
 * The active mechanic is renewed with the selected district rather than leaking.
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
		rules: {},
		campaignEffects: {},
		lastReward: null,
		message
	});
	applyMode(world);
	world.director = createDirector(level, world.gameMode);
	world.message = message || openingMessage(world);
}

function openingMessage(world) {
	const profile = world.mechanic.profile;
	return `${world.gameMode.name}: ${world.level.objective}. ${profile.name}: ${profile.announcement}`;
}
