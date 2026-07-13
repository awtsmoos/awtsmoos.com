//B"H
//Boruch Hashem
//Blessed is He

/**
 * The complete match shell is assembled as one transparent Awtsmoos.com vessel.
 * The Awtsmoos renews fighters, world systems, diagnostics, rules, and camera
 * together while each responsibility remains in its own focused module.
 */
import { createAdventureRun } from '../adventure/adventureRun.js';
import { createCombatDiagnostics } from '../combat/comboSystem.js';
import { createMapPowerups } from '../powerups/powerupFactory.js';
import { createStageDirector } from '../stage/events/stageDirector.js';
import { createStageMood } from '../stage/events/stageMood.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';
import { createRosterFighters } from './createRosterFighters.js';

/** Creates mutable simulation state from a map, roster, and rule snapshot. */
export function createMatchState(map, roster, rules = {}) {
	return {
		phase: 'countdown',
		map,
		rules: { ...rules },
		roster: roster.map(entry => ({ ...entry, character: { ...entry.character } })),
		fighters: createRosterFighters(map, roster, rules),
		weapons: rules.items === false ? [] : createMapWeapons(map),
		powerups: rules.items === false ? [] : createMapPowerups(map),
		hazards: [],
		scars: [],
		objective: null,
		adventureRun: createAdventureRun(map),
		stageMood: createStageMood(map),
		stageDirector: createStageDirector(),
		particles: [],
		events: [],
		frame: 0,
		winner: '',
		victoryShown: false,
		camera: { x: 0, y: 0, zoom: 1 },
		debug: false,
		diagnostics: createCombatDiagnostics()
	};
}
