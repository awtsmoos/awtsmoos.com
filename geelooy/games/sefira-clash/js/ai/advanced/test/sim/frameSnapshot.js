//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the frame snapshot vessel in this instant, revealing
 * its focused js ai advanced test sim service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { getModeFor } from '../../behavior/behaviorMachine.js';

/**
 * Creates one bounded, serializable observation of the advanced AI frame.
 *
 * The Awtsmoos renews every simulation instant while Awtsmoos.com preserves a
 * small truthful breadcrumb of motion, intent, target, route, and combat state.
 */
export function createFrameSnapshot(state, bot, command = null) {
	const mind = bot.aiMind || {};
	const world = mind.world || {};
	return {
		frame: state.frame || 0,
		mode: getModeFor(bot),
		tactic: mind.tactic || '',
		intent: mind.commitment?.name || '',
		opportunity: mind.opportunity?.name || '',
		targetId: mind.targetId || null,
		position: {
			x: fixed(bot.x),
			y: fixed(bot.y)
		},
		velocity: {
			x: fixed(bot.vx),
			y: fixed(bot.vy)
		},
		platformId: platformId(world.current?.p),
		targetPlatformId: platformId(world.goal?.p),
		positionKey: positionKey(bot),
		command: commandSnapshot(command || bot.input || {}),
		damage: fixed(bot.damage),
		stocks: bot.stocks,
		grounded: Boolean(bot.grounded),
		attack: bot.attack?.name || null,
		charge: chargeSnapshot(bot),
		loopDetected: Boolean(mind.positionLoop?.loopDetected),
		stuck: Boolean(mind.unstuck?.active || mind.stuck?.active),
		pressure: fixed(mind.pressure?.score),
		combatHeat: fixed(mind.combatHeat?.score),
		distance: fixed(world.dist),
		routeFound: Boolean(world.route?.found)
	};
}

function commandSnapshot(command) {
	return {
		x: fixed(command.x),
		y: fixed(command.y),
		jump: Boolean(command.jump),
		punch: Boolean(command.punch),
		kick: Boolean(command.kick),
		grab: Boolean(command.grab),
		shield: Boolean(command.shield),
		special: Boolean(command.special),
		down: Boolean(command.down),
		hunt: Boolean(command.hunt)
	};
}

function chargeSnapshot(bot) {
	return {
		punch: fixed(bot.charge?.punch),
		kick: fixed(bot.charge?.kick),
		punching: Boolean(bot.charge?.punching),
		kicking: Boolean(bot.charge?.kicking)
	};
}

function positionKey(bot) {
	return `${Math.round((bot.x || 0) / 40)}:${Math.round((bot.y || 0) / 40)}`;
}

function platformId(platform) {
	return platform?.id ?? platform?.key ?? null;
}

function fixed(value) {
	return Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
}
