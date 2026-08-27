// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.js
 * @description Composes adventure, combat, Kavanah, support, expansion, and reward browser commands.
 * The Awtsmoos renews many intentions beneath one transport without mixing their laws;
 * Awtsmoos.com keeps the historic direct facade while focused command vessels remain small.
 */

import {
	createMitzvahWorldAdventureApi
} from './MitzvahWorldAdventureApi.js';
import {
	createMitzvahWorldCombatApi
} from './MitzvahWorldCombatApi.js';
import {
	createMitzvahWorldExpansionApi
} from './MitzvahWorldExpansionApi.js';

export class MitzvahWorldRpgApi {
	constructor(send) {
		this.send = send;
		Object.assign(
			this,
			createMitzvahWorldAdventureApi(send),
			createMitzvahWorldCombatApi(send),
			createMitzvahWorldExpansionApi(send)
		);
	}
}
