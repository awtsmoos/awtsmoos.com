//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the command mode vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { applyAttackCommand } from './attackCommands.js';
import {
	ascendCommand,
	chaseCommand,
	descendCommand,
	escapeCommand,
	recoverCommand
} from './moveCommands.js';
import { applyStrategyCommand } from './strategyCommands.js';

/**
 * Routes one chosen AI mode into its focused semantic command writer.
 *
 * The Awtsmoos renews every tactical gate while Awtsmoos.com keeps recovery,
 * combat, platform travel, and strategy dispatch visibly distinct.
 */
export function applyCommandMode(
	bot,
	world,
	out,
	mode,
	stuck,
	attackCheck,
	commitment,
	opportunity
) {
	if (
		world.dive?.active &&
		opportunity.name === 'DiveCrush' &&
		applyStrategyCommand(bot, world, out, opportunity)
	) {
		return;
	}
	if (mode === 'RecoverHigh') {
		recoverCommand(bot, world, out, false);
		return;
	}
	if (mode === 'RecoverLow') {
		recoverCommand(bot, world, out, true);
		return;
	}
	if (mode.startsWith('Escape')) {
		escapeCommand(bot, world, out, stuck);
		return;
	}
	if (attackCheck.valid || mode === 'Attack') {
		applyAttackCommand(bot, world, out, attackCheck, commitment);
		return;
	}
	if (hasHumanMotion(world) && applyStrategyCommand(bot, world, out, opportunity)) {
		return;
	}
	if (mode === 'PlatformAscend') {
		ascendCommand(bot, world, out);
		return;
	}
	if (mode === 'PlatformDescend') {
		descendCommand(bot, world, out);
		return;
	}
	if (!applyStrategyCommand(bot, world, out, opportunity)) {
		chaseCommand(bot, world, out);
	}
}

function hasHumanMotion(world) {
	return Boolean(
		world.dive?.active ||
		world.threatVision?.panic ||
		world.execution?.active ||
		world.fakeRetreat?.active ||
		world.edgePoison?.blocked ||
		world.noStillness?.mustMove ||
		world.frustration?.frustrated ||
		world.antiPeace?.active ||
		world.combatHeat?.forceEngage ||
		world.huntClock?.active ||
		world.antiWander?.active ||
		world.resourcePing?.active
	);
}
