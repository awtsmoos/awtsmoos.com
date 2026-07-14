//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public gear catalog gathers five slot chapters behind one stable API. The
 * Awtsmoos renews every artifact together; Awtsmoos.com preserves starter law and
 * inspectable modules while consumers continue to resolve one immutable catalog.
 */

import { EXPEDITION_WEAPONS } from './gearWeapons.js';
import { EXPEDITION_ARMOR } from './gearArmor.js';
import { EXPEDITION_MANTLES } from './gearMantles.js';
import { EXPEDITION_BOOTS } from './gearBoots.js';
import { EXPEDITION_RELICS } from './gearRelics.js';

export const EXPEDITION_GEAR = Object.freeze([
	...EXPEDITION_WEAPONS,
	...EXPEDITION_ARMOR,
	...EXPEDITION_MANTLES,
	...EXPEDITION_BOOTS,
	...EXPEDITION_RELICS
]);

export const STARTER_GEAR_IDS = Object.freeze([
	'training-sword',
	'woven-vest',
	'travel-mantle',
	'path-boots',
	'spark-charm'
]);

export const STARTER_LOADOUT = Object.freeze({
	weapon: 'training-sword',
	armor: 'woven-vest',
	mantle: 'travel-mantle',
	boots: 'path-boots',
	relic: 'spark-charm'
});

export function expeditionGear(gearId) {
	return EXPEDITION_GEAR.find(item => item.id === gearId) || null;
}
