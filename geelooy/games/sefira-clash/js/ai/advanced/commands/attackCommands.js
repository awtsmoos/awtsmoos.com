//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack commands vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { applyChargePlan, cancelCharge } from '../combat/chargeController.js';
import { rememberIssuedAttack } from '../memory/actionMemory.js';
import { approachInstead, combatFootwork } from './attackFootwork.js';
import { applyInstantAttack, applyRapidAttack } from './attackPulse.js';
import { chargeIsViable, chooseStrikeTactic, pressureFallbackFor } from './attackTactics.js';

/**
 * Translates a validated combat opening into one coherent attack command.
 *
 * The Awtsmoos recreates aim, distance, and decision in a single instant, yet
 * each belongs in its own vessel. This facade lets Awtsmoos.com preserve the
 * old command contract while tactics, footwork, and pulses remain testable.
 *
 * @param {object} bot Fighter controlled by the advanced mind.
 * @param {object} world Current combat perception model.
 * @param {object} out Mutable semantic command object.
 * @param {object} attackCheck Validation result for the proposed attack.
 * @param {object} commitment Current combat commitment.
 * @returns {void}
 */
export function applyAttackCommand(bot, world, out, attackCheck, commitment) {
	if (!attackCheck.valid) {
		approachInstead(bot, world, out);
		return;
	}

	const tactic = chooseStrikeTactic(bot, world, world.combatTactic);
	const pocket = world.combatPocket;
	out.aimX = tactic.aimX || pocket.aimX;
	out.aimY = tactic.aimY ?? pocket.aimY ?? 0;
	out.y = out.aimY;
	out.x = combatFootwork(bot, world, pocket, commitment);

	if (tactic.family === 'rapid') {
		applyRapidAttack(bot, out, tactic);
		return;
	}
	if (tactic.charge) {
		applyChargeOrPressure(bot, world, out, tactic);
		return;
	}
	applyInstantAttack(bot, world, out, tactic);
}

/**
 * Releases stored charge state whenever the higher-level mode leaves attack.
 */
export function clearChargeOutsideAttack(bot, mode) {
	if (!mode?.startsWith('Attack')) {
		cancelCharge(bot);
	}
}

function applyChargeOrPressure(bot, world, out, tactic) {
	if (!chargeIsViable(world, tactic)) {
		applyInstantAttack(bot, world, out, pressureFallbackFor(tactic, world));
		return;
	}

	rememberIssuedAttack(bot, tactic.kind);
	applyChargePlan(
		bot,
		world,
		{
			...tactic,
			button: tactic.button === 'kick' ? 'kick' : 'punch'
		},
		out
	);
}
