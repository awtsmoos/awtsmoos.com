//B"H
//Boruch Hashem
//Blessed is He

/**
 * Roster entries descend into embodied fighters through this Awtsmoos.com gate.
 * The Awtsmoos renews each seat with a distinct spawn, character, weapon, team,
 * device, color, and intelligence without erasing the shared fighter contract.
 */
import { applyPersonality } from '../ai/advanced/personality/applyPersonality.js';
import { applyCharacterProfile } from '../fighters/applyCharacterProfile.js';
import { applyHatStats } from '../fighters/applyHatStats.js';
import { createFighter } from '../fighters/createFighter.js';

/** Creates every runtime fighter from a validated match roster. */
export function createRosterFighters(map, roster, rules = {}) {
	return roster.map(entry => createRosterFighter(map, entry, rules));
}

function createRosterFighter(map, entry, rules) {
	const spawn = spawnFor(map, entry.index);
	const human = entry.kind === 'human';
	const seed = `${entry.character.seed}-${entry.slotId}`;
	const fighter = createFighter(seed, spawn.x, spawn.y, human);
	applyCharacterProfile(fighter, entry.character);
	applySlotIdentity(fighter, entry, rules);
	applyCosmetic(fighter, entry.cosmetic);
	if (!human) {
		applyPersonality(fighter, entry.index);
	}
	return applyHatStats(fighter);
}

function applySlotIdentity(fighter, entry, rules) {
	fighter.id = entry.slotId;
	fighter.slotId = entry.slotId;
	fighter.playerIndex = entry.index;
	fighter.playerTag = entry.kind === 'human' ? `P${entry.index + 1}` : `CPU ${entry.index + 1}`;
	fighter.team = entry.team;
	fighter.playerColor = entry.color;
	fighter.deviceId = entry.deviceId;
	fighter.cpuDifficulty = entry.cpuDifficulty || rules.cpuDifficulty || 2;
	fighter.stocks = rules.stocks || 3;
}

function applyCosmetic(fighter, cosmetic = {}) {
	fighter.dna.hue = Number(cosmetic.hue ?? fighter.dna.hue);
	fighter.cosmetic = {
		headwear: cosmetic.headwear || 'kippah',
		hue: fighter.dna.hue
	};
}

function spawnFor(map, index) {
	const spawns = map.spawns?.length ? map.spawns : [{ x: 0, y: 0 }];
	const source = spawns[index % spawns.length];
	const lap = Math.floor(index / spawns.length);
	const direction = index % 2 === 0 ? 1 : -1;
	return { x: source.x + lap * 34 * direction, y: source.y };
}
