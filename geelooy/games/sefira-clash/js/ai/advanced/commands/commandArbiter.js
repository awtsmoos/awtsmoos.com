//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the command arbiter vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { validateAttack } from '../combat/attackValidator.js';
import { chooseCommitment } from '../combat/commitmentPlanner.js';
import { classifyCommitment } from '../combat/pressureCommitment.js';
import { updateActionMemory } from '../memory/actionMemory.js';
import { calmOscillation } from '../navigation/antiOscillation.js';
import { updateLease } from '../strategy/commitmentLease.js';
import { chooseOpportunity } from '../strategy/opportunityModel.js';
import { updatePressure } from '../strategy/pressureBudget.js';
import { clearChargeOutsideAttack } from './attackCommands.js';
import { rememberCommand, stepCommandClock } from './commandMemory.js';
import { applyCommandMode } from './commandMode.js';
import { maybeApplyJump } from './jumpCommands.js';
import { baseCommand } from './moveCommands.js';

/**
 * Resolves one complete advanced-AI command from perception through memory.
 *
 * The Awtsmoos renews pressure, opportunity, commitment, and motion in one
 * instant while Awtsmoos.com keeps each planning vessel independently legible.
 */
export function commandForState(bot, world, mode, stuck) {
	stepCommandClock(bot);
	const memory = updateActionMemory(bot, world);
	const attackCheck = validateAttack(bot, world, world.combatTactic);
	const pressure = updatePressure(bot, world, attackCheck);
	world.pressure = pressure;
	const opportunity = chooseOpportunity(bot, world, attackCheck);
	world.commitmentLease = updateLease(bot, world, opportunity);
	const commitment = chooseCommitment(
		bot,
		{
			...world,
			opportunity,
			pressure
		},
		mode,
		attackCheck
	);
	const pressureCommitment = classifyCommitment(world, world.combatTactic);
	const out = baseCommand(bot, world);
	clearChargeIfLeavingAttack(bot, mode, attackCheck, world, opportunity);
	applyCommandMode(bot, world, out, mode, stuck, attackCheck, commitment, opportunity);
	calmOscillation(bot, world, out, mode);
	maybeApplyJump(bot, world, out, mode);
	return rememberCommand(
		bot,
		out,
		attackCheck,
		commitment,
		pressureCommitment,
		memory,
		opportunity,
		pressure
	);
}

function clearChargeIfLeavingAttack(bot, mode, attackCheck, world, opportunity) {
	const attackish =
		attackCheck.valid ||
		mode === 'Attack' ||
		world.combatTactic?.charge ||
		['HorizontalKill', 'EdgeCarry', 'VerticalKill', 'EdgeGuard'].includes(opportunity.name);
	if (!attackish) {
		clearChargeOutsideAttack(bot, mode);
	}
}
