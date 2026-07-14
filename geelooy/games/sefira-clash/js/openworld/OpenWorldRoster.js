//B"H
//Boruch Hashem
//Blessed is He

/**
 * The lived-world roster creates one traveler and one non-hostile training partner.
 * The Awtsmoos renews both embodied roles; Awtsmoos.com preserves fighter-factory
 * compatibility while stripping weapons, stocks-as-lives, and hostile ownership.
 */

import { characterById } from '../data/characters.js';

export function createOpenWorldRoster(character, cosmetic) {
	return [
		{
			slotId: 'open-world-player',
			index: 0,
			kind: 'human',
			deviceId: 'keyboard',
			character: characterById(character?.id),
			team: 1,
			color: '#6fe7ff',
			cosmetic: { ...cosmetic }
		},
		{
			slotId: 'open-world-trainer',
			index: 1,
			kind: 'cpu',
			deviceId: null,
			character: characterById('chesed-fist'),
			team: 2,
			color: '#bdf8d0',
			cpuDifficulty: 0,
			cosmetic: { headwear: 'kippah', hue: 142 }
		}
	];
}

export function prepareOpenWorldFighters(state) {
	for (const fighter of state.fighters) {
		fighter.heldWeapon = null;
		fighter.loadout = { primary: null, openWorldHandsOnly: true };
		fighter.stocks = 99;
		fighter.dead = false;
		fighter.respawnTimer = 0;
		fighter.hidden = !fighter.human;
		fighter.openWorldCivilian = !fighter.human;
	}
	const trainer = state.fighters.find(fighter => !fighter.human);
	if (trainer) {
		trainer.name = 'Training Partner';
		trainer.blocking = false;
	}
}
