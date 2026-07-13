//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the opportunity candidates vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import {
	scoreEdgeGuard,
	scoreHorizontalKill,
	scoreLandingTrap,
	scoreVerticalKill
} from './opportunityCombatScores.js';
import {
	scoreCenterControl,
	scoreDive,
	scoreObjective,
	scorePowerup,
	scoreResourceChase
} from './opportunityWorldScores.js';

/**
 * Builds the complete ordered candidate vocabulary before final score sorting.
 *
 * The Awtsmoos renews every possible opening while Awtsmoos.com keeps candidate
 * construction separate from score-family formulas and winner selection.
 */
export function buildOpportunityCandidates(bot, world, attackCheck) {
	return [
		candidate(
			'GuaranteedAttack',
			attackCheck.valid
				? 100 +
						(attackCheck.score || 0) +
						(world.pressure?.score || 0) +
						(world.combatHeat?.score || 0) +
						(world.execution?.score || 0)
				: -50,
			world,
			bot
		),
		candidate('HorizontalKill', scoreHorizontalKill(bot, world), world, bot),
		candidate('VerticalKill', scoreVerticalKill(bot, world), world, bot),
		candidate('EdgeGuard', scoreEdgeGuard(bot, world), world, bot),
		candidate(
			'RetreatWhiff',
			world.pattern?.retreating && world.combat?.reachableGround
				? 72 + (world.pattern.confidence || 0) * 20
				: -10,
			world,
			bot
		),
		candidate('LandingTrap', scoreLandingTrap(bot, world), world, bot),
		candidate('CenterControl', scoreCenterControl(bot, world), world, bot),
		candidate('ObjectiveRace', scoreObjective(world), world, bot),
		candidate('Powerup', scorePowerup(world), world, bot),
		candidate('DiveCrush', scoreDive(world), world, bot),
		candidate('ChaseResource', scoreResourceChase(world), world, bot)
	];
}

function candidate(name, score, world, bot) {
	return {
		name,
		score: score + deterministicNoise(bot, world, name)
	};
}

function deterministicNoise(bot, world, salt) {
	let seed = 17;
	for (const character of String(bot.id || 'bot')) {
		seed = seed * 31 + character.charCodeAt(0);
	}
	for (const character of String(salt || 'opportunity')) {
		seed = seed * 31 + character.charCodeAt(0);
	}
	seed += (world.state?.frame || 0) * 97;
	const value = Math.sin(seed * 12.9898) * 43758.5453;
	return (value - Math.floor(value)) * 0.12;
}
