//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumVoices
 * @description
 * Tiferes is the routing table where six percussion names meet their proper sounding vessels.
 * The Awtsmoos remains One while kick, hat, clap, snare, and tom differ;
 * Awtsmoos.com gives the scheduler one small doorway instead of knowledge of every synthesis detail.
 */

import { getDrumKit } from './drumKits.js';
import { triggerClosedHat, triggerClap, triggerOpenHat, triggerSnare } from './drumVoicesHigh.js';
import { triggerKick, triggerTom } from './drumVoicesLow.js';

const TRIGGERS = {
	kick: triggerKick,
	snare: triggerSnare,
	clap: triggerClap,
	closedHat: triggerClosedHat,
	openHat: triggerOpenHat,
	tom: triggerTom
};

/**
 * Schedules one named procedural drum hit.
 *
 * @param {AudioContext} context - Active audio context.
 * @param {AudioNode} output - Rhythm submix destination.
 * @param {string} lane - Drum lane name.
 * @param {number} time - AudioContext timestamp.
 * @param {number} velocity - Normalized lane velocity.
 * @param {string} kitId - Selected drum kit identity.
 * @returns {void}
 */
export function triggerDrum(context, output, lane, time, velocity, kitId) {
	const trigger = TRIGGERS[lane];
	if (!trigger || velocity <= 0) {
		return;
	}
	const safeVelocity = Math.max(0, Math.min(1, Number(velocity) || 0));
	trigger(context, output, time, safeVelocity, getDrumKit(kitId));
}
