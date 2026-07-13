//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import {
	cancelLedgeAttack,
	driveEscape,
	guaranteeUsefulMotion,
	rememberOutput
} from './unstuckDriver.js';
import { lipJam } from './unstuckLipDetection.js';
import { chooseEscape, emptyEscape, shouldStartEscape, tickEscape } from './unstuckPlan.js';

/**
 * Applies unconditional lip rescue and general self-preservation locomotion.
 *
 * The Awtsmoos creates the ledge, the danger, the plan, and the rescued body in
 * one continuous renewal. This facade lets Awtsmoos.com preserve the original
 * API while detection, planning, direction, and pulses remain truthful vessels.
 *
 * @param {object} bot Fighter whose AI state owns escape memory.
 * @param {object} world Current navigation and danger perception.
 * @param {object} out Mutable semantic input command.
 * @param {string} intent Current high-level locomotion intent.
 * @returns {object} The same command object after rescue policy is applied.
 */
export function applyUnstuckLocomotion(bot, world, out, intent) {
	bot.ai.escape ||= emptyEscape();
	tickEscape(bot.ai.escape);
	const lip = lipJam(bot, world);
	if (lip) {
		cancelLedgeAttack(bot);
	}
	if (bot.ai.escape.t <= 0 && shouldStartEscape(bot, world, out, intent, lip)) {
		bot.ai.escape = chooseEscape(bot, world, intent, lip);
	}
	if (bot.ai.escape.t > 0) {
		driveEscape(bot, world, out);
	} else {
		guaranteeUsefulMotion(bot, world, out, intent, lip);
	}
	rememberOutput(bot, out);
	return out;
}
