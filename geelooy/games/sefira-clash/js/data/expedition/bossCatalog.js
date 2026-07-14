//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public boss catalog gathers ten phase-authored climax guardians. The Awtsmoos
 * renews every escalation without hidden randomness; Awtsmoos.com keeps one stable
 * lookup surface while lower and upper scripts remain small enough to inspect.
 */

import { LOWER_EXPEDITION_BOSSES } from './bossesLower.js';
import { UPPER_EXPEDITION_BOSSES } from './bossesUpper.js';

export const EXPEDITION_BOSSES = Object.freeze([
	...LOWER_EXPEDITION_BOSSES,
	...UPPER_EXPEDITION_BOSSES
]);

export function expeditionBossForLocation(locationId) {
	return EXPEDITION_BOSSES.find(boss => boss.locationId === locationId) || null;
}
