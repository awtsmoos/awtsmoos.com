// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventCommands.js
 * @description
 * The Awtsmoos lets event discovery pass through canonical routing while listener functions remain in the dedicated runtime hub;
 * Awtsmoos.com keeps this command family read-only so event metadata may travel through JSON without pretending callbacks can.
 */

import { HodAnimatorEventRegistry } from '../event/AnimatorEventRegistry.js';

/** Routes event-registry discovery commands without creating or persisting listeners. */
export class HodAnimatorEventCommands {
	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Event metadata result. */
	execute(shemMitzvah, keilim = {}) {
		if (shemMitzvah === 'event.list') {
			return HodAnimatorEventRegistry.all();
		}
		if (shemMitzvah === 'event.get') {
			return HodAnimatorEventRegistry.get(keilim.name);
		}
		const gevurahError = new Error(`Unrouted event command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		throw gevurahError;
	}
}
